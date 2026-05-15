import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import {
    ALLERGY_GROUPS,
    buildAllergyGroupsFromServer,
    getAllergyByCode,
    normalizeAllergies,
    toAllergyCodes,
} from '@/constants/allergyList';
import { RELIGIOUS_OPTIONS, getReligiousOptionByCode, toServerReligiousCode } from '@/data/religiousOptions';
import {
    getAllergySetting,
    updateAllergySetting,
    getReligionSetting,
    updateReligionSetting,
    getReligionOptions,
    getAllergyOptions,
} from '@/api/settings';
import { useTranslation, t as tFn } from '@/lib/i18n';

type ReligionChoice = { code: string; label: string };

const FALLBACK_RELIGION_CHOICES: ReligionChoice[] = RELIGIOUS_OPTIONS.map((option) => ({
    code: option.code,
    label: option.label,
}));

interface AllergySettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    persistToServer?: boolean;
}

export default function AllergySettings({
    title,
    subtitle,
    showHeader = true,
    persistToServer = true,
}: AllergySettingsProps) {
    const t = useTranslation();
    const queryClient = useQueryClient();
    const allergies = useAppStore((state) => state.allergies);
    const setAllergies = useAppStore((state) => state.setAllergies);
    const religiousCode = useAppStore((state) => state.religiousCode);
    const setReligiousCode = useAppStore((state) => state.setReligiousCode);
    const [isSyncingAllergies, setIsSyncingAllergies] = useState(false);
    const [isSyncingReligion, setIsSyncingReligion] = useState(false);

    // 알러지/종교 변경 후 메뉴 캐시 무효화 — 서버가 새 설정 기준으로
    // matchedAllergies/risk를 재계산한 응답을 다시 가져오게 함.
    const invalidateMenuCaches = () => {
        queryClient.invalidateQueries({ queryKey: ['weeklyMeals'] });
        queryClient.invalidateQueries({ queryKey: ['menuDetail'] });
    };
    const resolvedTitle = title ?? t('allergy.title');
    const resolvedSubtitle = subtitle ?? t('allergy.subtitle');
    const NONE_RELIGION_CHOICE: ReligionChoice = { code: 'NONE', label: t('allergy.noRestriction') };

    const normalizedAllergies = useMemo(() => normalizeAllergies(allergies), [allergies]);
    const selectedReligiousOption = useMemo(() => getReligiousOptionByCode(religiousCode), [religiousCode]);

    const { data: religionOptionsResponse } = useQuery({
        queryKey: ['religionOptions'],
        queryFn: getReligionOptions,
        staleTime: 1000 * 60 * 60, // 1h — 옵션은 거의 안 바뀜
    });

    const religionChoices: ReligionChoice[] = useMemo(() => {
        const serverOptions = religionOptionsResponse?.data?.religions;
        if (serverOptions && serverOptions.length > 0) {
            return [
                NONE_RELIGION_CHOICE,
                ...serverOptions.map((option) => ({ code: option.code, label: option.name })),
            ];
        }
        return FALLBACK_RELIGION_CHOICES;
    }, [religionOptionsResponse]);

    const { data: allergyOptionsResponse } = useQuery({
        queryKey: ['allergyOptions'],
        queryFn: getAllergyOptions,
        staleTime: 1000 * 60 * 60,
    });

    const displayedAllergyGroups = useMemo(() => {
        const serverItems = allergyOptionsResponse?.data?.allergies;
        if (serverItems && serverItems.length > 0) {
            return buildAllergyGroupsFromServer(serverItems);
        }
        return ALLERGY_GROUPS;
    }, [allergyOptionsResponse]);

    // 서버가 지원하지 않는 라벨이 zustand에 남아있으면 자동 제거.
    // (이전 버전의 클라이언트가 저장해둔 Clam/Sesame 같은 deprecated 항목 정리)
    useEffect(() => {
        const serverItems = allergyOptionsResponse?.data?.allergies;
        if (!serverItems || serverItems.length === 0) return;
        if (normalizedAllergies.length === 0) return;

        const supportedLabels = new Set<string>();
        for (const item of serverItems) {
            const upper = (item?.code ?? '').trim().toUpperCase();
            if (!upper) continue;
            const local = getAllergyByCode(upper);
            if (local) {
                supportedLabels.add(local.label);
            } else if (item.name) {
                // 서버에만 있는 신규 코드 — buildAllergyGroupsFromServer가 만드는 라벨과 일치시킴
                supportedLabels.add(item.name);
            }
        }

        const filtered = normalizedAllergies.filter((label) => supportedLabels.has(label));
        if (filtered.length !== normalizedAllergies.length) {
            setAllergies(filtered);
        }
    }, [allergyOptionsResponse, normalizedAllergies, setAllergies]);

    useEffect(() => {
        if (!persistToServer) return;

        let mounted = true;

        const loadSettings = async () => {
            try {
                const [allergyResult, religionResult] = await Promise.all([
                    getAllergySetting(),
                    getReligionSetting(),
                ]);

                if (!mounted) return;

                if (Array.isArray(allergyResult?.data?.allergyCodes)) {
                    setAllergies(allergyResult.data.allergyCodes);
                }

                if (typeof religionResult?.data?.religiousCode === 'string' || religionResult?.data?.religiousCode === null) {
                    setReligiousCode(religionResult.data.religiousCode ?? 'NONE');
                }
            } catch (error) {
                console.warn('Failed to load allergy/religion settings:', error);
            }
        };

        loadSettings();

        return () => {
            mounted = false;
        };
    }, [persistToServer, setAllergies, setReligiousCode]);

    const toggleAllergy = async (selectedLabel: string) => {
        const nextAllergies = normalizedAllergies.includes(selectedLabel)
            ? normalizedAllergies.filter((item) => item !== selectedLabel)
            : [...normalizedAllergies, selectedLabel];

        setAllergies(nextAllergies);

        if (!persistToServer) return;

        try {
            setIsSyncingAllergies(true);
            await updateAllergySetting(toAllergyCodes(nextAllergies));
            // 서버 PATCH 성공 → 메뉴 캐시 무효화 (matchedAllergies/risk 재계산)
            invalidateMenuCaches();
        } catch (error: any) {
            setAllergies(normalizedAllergies);
            Alert.alert(tFn('allergy.updateFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSyncingAllergies(false);
        }
    };

    const handleReligiousSelect = async (code: string) => {
        const nextCode = selectedReligiousOption.code === code ? 'NONE' : code;
        const previousCode = religiousCode;
        setReligiousCode(nextCode);

        if (!persistToServer) return;

        try {
            setIsSyncingReligion(true);
            await updateReligionSetting(toServerReligiousCode(nextCode));
            // 종교 변경도 위험도 계산에 영향 → 메뉴 캐시 무효화
            invalidateMenuCaches();
        } catch (error: any) {
            setReligiousCode(previousCode);
            Alert.alert(tFn('allergy.religionUpdateFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSyncingReligion(false);
        }
    };

    return (
        <ScrollView className="flex-1 px-5 pt-8">
            {showHeader ? (
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{resolvedTitle}</Text>
                    <Text className="text-gray-500 text-lg">{resolvedSubtitle}</Text>
                    <View className="mt-4 self-start rounded-full bg-gray-100 px-4 py-2">
                        <Text className="text-sm font-semibold text-gray-700">
                            {t('allergy.selected', { count: normalizedAllergies.length })}
                        </Text>
                    </View>
                </View>
            ) : null}

            <View className="relative mb-6 rounded-[24px] border border-gray-200 bg-white px-4 py-5 pt-6">
                <View className="absolute -top-3 left-4 rounded-full bg-white px-2">
                    <Text className="text-sm font-semibold text-gray-500">{t('allergy.selectedRestrictions')}</Text>
                </View>
                <View className="mb-4">
                    <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {t('allergy.religious')}
                    </Text>
                    {selectedReligiousOption.code === 'NONE' ? (
                        <Text className="text-sm text-gray-400">{t('allergy.noReligiousSelected')}</Text>
                    ) : (
                        <View className="flex-row flex-wrap gap-2">
                            <View className="rounded-full bg-blue-500 px-3 py-2">
                                <Text className="text-xs font-semibold text-white">{selectedReligiousOption.label}</Text>
                            </View>
                        </View>
                    )}
                </View>
                <View>
                    <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {t('allergy.allergies')}
                    </Text>
                    {normalizedAllergies.length > 0 ? (
                        <View className="flex-row flex-wrap gap-2">
                            {normalizedAllergies.map((allergy) => (
                                <View key={allergy} className="rounded-full bg-blue-500 px-3 py-2">
                                    <Text className="text-xs font-semibold text-white">{allergy}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-sm text-gray-400">{t('allergy.noAllergiesSelected')}</Text>
                    )}
                </View>
            </View>

            <View
                className={`mb-6 rounded-[28px] border px-4 py-4 ${
                    selectedReligiousOption.code !== 'NONE' ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
                }`}
            >
                <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-900">{t('allergy.religious')}</Text>
                    <Text className="mt-1 text-sm text-gray-500">{t('allergy.religiousChoose')}</Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                    {religionChoices.map((option) => {
                        const isSelected = selectedReligiousOption.code === option.code;

                        return (
                            <TouchableOpacity
                                key={option.code}
                                disabled={isSyncingReligion}
                                className={`min-h-[46px] rounded-full border px-4 py-3 ${
                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => handleReligiousSelect(option.code)}
                            >
                                <Text className={`text-[15px] font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {displayedAllergyGroups.map((group) => {
                const groupHasSelection = group.items.some((item) => normalizedAllergies.includes(item.label));

                return (
                    <View
                        key={group.id}
                        className={`mb-6 rounded-[28px] border px-4 py-4 ${
                            groupHasSelection ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-900">{group.title}</Text>
                            <Text className="text-sm text-gray-500 mt-1">{group.subtitle}</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {group.items.map((item) => {
                                const isSelected = normalizedAllergies.includes(item.label);

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        disabled={isSyncingAllergies}
                                        className={`min-h-[46px] rounded-full border px-4 py-3 ${
                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white'
                                        }`}
                                        onPress={() => toggleAllergy(item.label)}
                                    >
                                        <Text
                                            className={`text-[15px] font-semibold ${
                                                isSelected ? 'text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}
