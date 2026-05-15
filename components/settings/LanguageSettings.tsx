import { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View, TouchableOpacity } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { getLanguageSetting, updateLanguageSetting, getLanguageOptions } from '@/api/settings';
import { useTranslation, t as tFn } from '@/lib/i18n';

type LanguageOption = {
    code: string;
    label: string;
};

interface LanguageSettingsProps {
    title?: string;
    subtitle?: string;
    options?: LanguageOption[];
    showHeader?: boolean;
    persistToServer?: boolean;
}

const DEFAULT_OPTIONS: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
];

export default function LanguageSettings({
    title,
    subtitle,
    options: optionsProp = DEFAULT_OPTIONS,
    showHeader = true,
    persistToServer = true,
}: LanguageSettingsProps) {
    const t = useTranslation();
    const language = useAppStore((state) => state.language);
    const setLanguage = useAppStore((state) => state.setLanguage);
    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = useState(false);
    const resolvedTitle = title ?? t('language.title');
    const resolvedSubtitle = subtitle ?? t('language.subtitle');

    const { data: languageOptionsResponse } = useQuery({
        queryKey: ['languageOptions'],
        queryFn: getLanguageOptions,
        staleTime: 1000 * 60 * 60,
    });

    const options: LanguageOption[] = useMemo(() => {
        const serverOptions = languageOptionsResponse?.data?.languages;
        if (serverOptions && serverOptions.length > 0) {
            return serverOptions.map((option) => ({
                code: option.code,
                label: option.englishName,
            }));
        }
        return optionsProp;
    }, [languageOptionsResponse, optionsProp]);

    const selectedLanguage = useMemo(() => {
        return options.some((option) => option.code === language) ? language : options[0]?.code ?? 'en';
    }, [language, options]);

    useEffect(() => {
        if (options.length > 0 && !options.some((option) => option.code === language)) {
            setLanguage(options[0].code);
        }
    }, [language, options, setLanguage]);

    useEffect(() => {
        if (!persistToServer) return;

        let mounted = true;

        const loadLanguage = async () => {
            try {
                const result = await getLanguageSetting();
                if (!mounted) return;

                if (result?.data?.languageCode && options.some((option) => option.code === result.data.languageCode)) {
                    setLanguage(result.data.languageCode);
                }
            } catch (error) {
                console.warn('Failed to load language setting:', error);
            }
        };

        loadLanguage();

        return () => {
            mounted = false;
        };
    }, [options, persistToServer, setLanguage]);

    const handleSelectLanguage = async (code: string) => {
        const previousLanguage = selectedLanguage;
        setLanguage(code);

        if (!persistToServer) return;

        try {
            setIsSyncing(true);
            await updateLanguageSetting(code);
            // 언어 변경 후 모든 server-backed 쿼리 무효화 → 새 언어로 자동 refetch
            // (메인의 weekly-meals, 상세의 menuDetail, 옵션 리스트 등)
            queryClient.invalidateQueries();
        } catch (error: any) {
            setLanguage(previousLanguage);
            Alert.alert(tFn('language.updateFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <View className="px-5 pt-10">
            {showHeader ? (
                <>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{resolvedTitle}</Text>
                    <Text className="text-gray-500 text-lg mb-10">{resolvedSubtitle}</Text>
                </>
            ) : null}

            <View className="gap-y-4">
                {options.map((lang) => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                        <TouchableOpacity
                            key={lang.code}
                            disabled={isSyncing}
                            className={`py-5 px-5 rounded-3xl border ${
                                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => handleSelectLanguage(lang.code)}
                        >
                            <Text className={`text-xl font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
