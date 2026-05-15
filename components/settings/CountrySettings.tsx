import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import {
    COUNTRY_LIST,
    normalizeCountryQuery,
    getCountryByCode,
    normalizeCountryCode,
    type CountryOption,
} from '@/data/countryList';
import { Ionicons } from '@expo/vector-icons';
import { getCountrySetting, updateCountrySetting, getCountryOptions } from '@/api/settings';
import { useTranslation, t as tFn } from '@/lib/i18n';

interface CountrySettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    persistToServer?: boolean;
}

export default function CountrySettings({
    title,
    subtitle,
    showHeader = true,
    persistToServer = true,
}: CountrySettingsProps) {
    const t = useTranslation();
    const country = useAppStore((state) => state.country);
    const setCountry = useAppStore((state) => state.setCountry);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const resolvedTitle = title ?? t('country.title');
    const resolvedSubtitle = subtitle ?? t('country.subtitle');

    const selectedCountry = useMemo(() => getCountryByCode(country), [country]);

    const { data: countryOptionsResponse } = useQuery({
        queryKey: ['countryOptions'],
        queryFn: getCountryOptions,
        staleTime: 1000 * 60 * 60, // 1h — 옵션은 거의 안 바뀜
    });

    // 서버가 지원하는 국가만 표시. world-countries 메타(국기/언어)로 enrich.
    const supportedCountries: CountryOption[] = useMemo(() => {
        const serverCountries = countryOptionsResponse?.data?.countries;
        if (!serverCountries || serverCountries.length === 0) {
            return COUNTRY_LIST; // 폴백: 전체 리스트
        }

        return serverCountries
            .map((server) => {
                const code = normalizeCountryCode(server.code);
                const enriched = getCountryByCode(code);
                if (enriched) return enriched;

                // world-countries에 없는 코드 — 서버 데이터만으로 최소 메타 구성
                return {
                    code,
                    label: server.name,
                    officialName: server.name,
                    flag: '🌍',
                    language: 'English',
                    aliases: [server.name, code],
                    searchTerms: [server.name, code],
                } satisfies CountryOption;
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [countryOptionsResponse]);

    const filteredCountries = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return supportedCountries;

        return supportedCountries.filter((item) =>
            normalizeCountryQuery(item).some((value) => value.toLowerCase().includes(query))
        );
    }, [searchQuery, supportedCountries]);

    const handleSelect = (code: string) => {
        const previousCountry = country;
        setCountry(code);
        setIsPickerOpen(false);

        if (!persistToServer) return;

        setIsSyncing(true);
        updateCountrySetting(code)
            .catch((error: any) => {
                setCountry(previousCountry);
                Alert.alert(tFn('country.updateFailed'), error?.message ?? tFn('common.tryAgain'));
            })
            .finally(() => setIsSyncing(false));
    };

    useEffect(() => {
        if (!persistToServer) return;

        let mounted = true;

        const loadCountry = async () => {
            try {
                const result = await getCountrySetting();
                if (!mounted) return;

                if (result?.data?.countryCode) {
                    setCountry(result.data.countryCode);
                }
            } catch (error) {
                console.warn('Failed to load country setting:', error);
            }
        };

        loadCountry();

        return () => {
            mounted = false;
        };
    }, [persistToServer, setCountry]);

    return (
        <View className="px-5 pt-10">
            {showHeader ? (
                <>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{resolvedTitle}</Text>
                    <Text className="text-gray-500 text-lg mb-6">{resolvedSubtitle}</Text>
                </>
            ) : null}

            <TouchableOpacity
                className="flex-row items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-50"
                onPress={() => setIsPickerOpen(true)}
            >
                <View className="flex-row items-center flex-1 pr-3">
                    <Text className="mr-3 text-xl">{selectedCountry?.flag ?? '🌍'}</Text>
                    <View className="flex-1">
                        <Text className="text-sm text-gray-500">{t('country.label')}</Text>
                        <Text className="text-lg font-semibold text-gray-900">
                            {selectedCountry?.label ?? t('country.placeholder')}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Modal
                visible={isPickerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsPickerOpen(false)}
            >
                <View className="flex-1">
                    <TouchableOpacity
                        activeOpacity={1}
                        className="absolute inset-0 bg-black/40"
                        onPress={() => setIsPickerOpen(false)}
                    />

                    <View className="absolute left-4 right-4 top-20 rounded-3xl bg-white p-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-semibold text-gray-900">{t('country.selectModalTitle')}</Text>
                            <TouchableOpacity
                                onPress={() => setIsPickerOpen(false)}
                                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                            >
                                <Ionicons name="close" size={18} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={t('country.searchPlaceholder')}
                            autoCapitalize="none"
                            className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                        />

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            keyboardShouldPersistTaps="handled"
                            style={{ maxHeight: 420 }}
                                renderItem={({ item }) => {
                                const isSelected = item.code === country;

                                return (
                                    <TouchableOpacity
                                        disabled={isSyncing}
                                        className={`mb-2 flex-row items-center rounded-2xl px-4 py-4 ${
                                            isSelected ? 'bg-red-50' : 'bg-gray-50'
                                        }`}
                                        onPress={() => handleSelect(item.code)}
                                    >
                                        <Text className="mr-3 text-2xl">{item.flag}</Text>
                                        <View className="flex-1 pr-3">
                                            <Text className="text-base font-semibold text-gray-900">{item.label}</Text>
                                        </View>
                                        {isSelected ? (
                                            <Ionicons name="checkmark" size={20} color="#dc2626" />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View className="items-center rounded-2xl bg-gray-50 px-4 py-10">
                                    <Text className="text-gray-500">{t('country.noMatch')}</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
