import { useEffect, useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { SCHOOL_LIST, type SchoolItem } from '@/data/schoolList';
import { getSchoolSetting, updateSchoolSetting, getSchoolOptions } from '@/api/settings';
import { useTranslation, t as tFn } from '@/lib/i18n';

interface SchoolSettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    persistToServer?: boolean;
}

export default function SchoolSettings({
    title,
    subtitle,
    showHeader = true,
    persistToServer = true,
}: SchoolSettingsProps) {
    const t = useTranslation();
    const schoolId = useAppStore((state) => state.schoolId);
    const setSchoolId = useAppStore((state) => state.setSchoolId);
    const [isSyncing, setIsSyncing] = useState(false);
    const resolvedTitle = title ?? t('school.title');
    const resolvedSubtitle = subtitle ?? t('school.subtitle');

    const { data: schoolOptionsResponse } = useQuery({
        queryKey: ['schoolOptions'],
        queryFn: getSchoolOptions,
        staleTime: 1000 * 60 * 60, // 1h
    });

    const displayedSchools: SchoolItem[] = useMemo(() => {
        const serverSchools = schoolOptionsResponse?.data?.schools;
        if (serverSchools && serverSchools.length > 0) {
            return serverSchools.map((server) => ({
                id: server.schoolId,
                label: server.name,
                aliases: [],
            }));
        }
        return SCHOOL_LIST;
    }, [schoolOptionsResponse]);

    const selectedSchool = useMemo(() => {
        if (schoolId === null) return undefined;
        return displayedSchools.find((school) => school.id === schoolId);
    }, [displayedSchools, schoolId]);

    // 서버 목록에 없는 schoolId가 zustand에 남아있으면 자동 제거
    useEffect(() => {
        const serverSchools = schoolOptionsResponse?.data?.schools;
        if (!serverSchools || serverSchools.length === 0) return;
        if (schoolId === null) return;

        const supportedIds = new Set(serverSchools.map((school) => school.schoolId));
        if (!supportedIds.has(schoolId)) {
            setSchoolId(null);
        }
    }, [schoolOptionsResponse, schoolId, setSchoolId]);

    useEffect(() => {
        if (!persistToServer) return;

        let mounted = true;

        const loadSchool = async () => {
            try {
                const result = await getSchoolSetting();
                if (!mounted) return;

                if (typeof result?.data?.schoolId === 'number') {
                    setSchoolId(result.data.schoolId);
                }
            } catch (error) {
                console.warn('Failed to load school setting:', error);
            }
        };

        loadSchool();

        return () => {
            mounted = false;
        };
    }, [persistToServer, setSchoolId]);

    const handleSelectSchool = async (nextSchoolId: number) => {
        const previousSchoolId = schoolId;
        setSchoolId(nextSchoolId);

        if (!persistToServer) return;

        try {
            setIsSyncing(true);
            await updateSchoolSetting(nextSchoolId);
        } catch (error: any) {
            setSchoolId(previousSchoolId);
            Alert.alert(tFn('school.updateFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <View className="px-5 pt-10">
            {showHeader ? (
                <>
                    <Text className="mb-2 text-3xl font-bold text-gray-900">{resolvedTitle}</Text>
                    <Text className="mb-6 text-lg text-gray-500">{resolvedSubtitle}</Text>
                </>
            ) : null}

            <View className="relative mb-6 rounded-[24px] border border-gray-200 bg-white px-4 py-5 pt-6">
                <View className="absolute -top-3 left-4 rounded-full bg-white px-2">
                    <Text className="text-sm font-semibold text-gray-500">{t('school.selectedHeader')}</Text>
                </View>
                {selectedSchool ? (
                    <View className="rounded-2xl bg-gray-50 px-4 py-3">
                        <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            {t('school.schoolNumber', { id: selectedSchool.id })}
                        </Text>
                        <Text className="mt-1 text-base font-semibold text-gray-900">{selectedSchool.label}</Text>
                    </View>
                ) : (
                    <Text className="text-sm text-gray-400">{t('school.noneSelected')}</Text>
                )}
            </View>

            <View className="gap-y-3">
                {displayedSchools.map((school) => {
                    const isSelected = school.id === schoolId;

                    return (
                        <TouchableOpacity
                            key={school.id}
                            disabled={isSyncing}
                            className={`rounded-[28px] border px-4 py-4 ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => handleSelectSchool(school.id)}
                        >
                            <View className="flex-row items-center">
                                <View className="flex-1 pr-3">
                                    <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                                        {t('school.schoolNumber', { id: school.id })}
                                    </Text>
                                    <Text className="mt-1 text-base font-semibold text-gray-900">{school.label}</Text>
                                </View>
                                <Ionicons
                                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={22}
                                    color={isSelected ? '#2563eb' : '#9CA3AF'}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
