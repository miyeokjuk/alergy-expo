import { useLocalSearchParams } from 'expo-router';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ScreenHeader from '@/components/ui/screen-header';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import { SpicyLevel } from '@/components/ui/spicy-level';
import {
    getWeeklyMeals,
    mapServerRiskLevel,
    MEAL_TYPE_LABEL,
} from '@/api/cafeteria';

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getMondayOfWeek(dateString: string): string {
    const d = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateString;
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return formatDate(d);
}

export default function MealDetailScreen() {
    const params = useLocalSearchParams<{
        date?: string;
        cafeteriaId?: string;
        cafeteriaName?: string;
        mealType?: string;
    }>();

    const date = String(params.date ?? '');
    const cafeteriaIdNum = parseInt(String(params.cafeteriaId ?? ''), 10);
    const cafeteriaId = Number.isFinite(cafeteriaIdNum) ? cafeteriaIdNum : null;
    const cafeteriaName = String(params.cafeteriaName ?? 'Cafeteria');
    const mealType = String(params.mealType ?? 'LUNCH');
    const mealLabel = MEAL_TYPE_LABEL[mealType] ?? mealType;

    const weekStartDate = useMemo(() => getMondayOfWeek(date), [date]);

    const { data: weeklyMealsResponse } = useQuery({
        queryKey: ['weeklyMeals', cafeteriaId, weekStartDate],
        queryFn: () => getWeeklyMeals(cafeteriaId as number, weekStartDate),
        enabled: cafeteriaId !== null && Boolean(weekStartDate),
        staleTime: 1000 * 60 * 10,
    });

    const schedule = useMemo(() => {
        const all = weeklyMealsResponse?.data?.mealSchedules ?? [];
        return all.find((s) => s.mealDate === date && s.mealType === mealType) ?? null;
    }, [weeklyMealsResponse, date, mealType]);

    const sortedMenus = useMemo(() => {
        if (!schedule) return [];
        return [...schedule.menus].sort((a, b) => a.displayOrder - b.displayOrder);
    }, [schedule]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title={`${cafeteriaName} (${mealLabel})`} />

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                {sortedMenus.length === 0 ? (
                    <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                        <Text className="text-gray-700 text-lg font-bold">식당 미운영</Text>
                        <Text className="text-gray-400 text-sm mt-2">
                            No detailed information is available for this meal.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {sortedMenus.map((menu) => {
                            const riskLevel = mapServerRiskLevel(menu.risk?.riskLevel);
                            return (
                                <View
                                    key={menu.mealMenuId}
                                    className="rounded-3xl border-2 border-gray-300 bg-white px-5 py-4"
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-xl font-bold text-gray-900 flex-1 pr-3">
                                            {menu.menuName}
                                        </Text>
                                        <RiskIndicator level={riskLevel} />
                                    </View>
                                    {menu.cornerName ? (
                                        <Text className="text-sm text-gray-500 mb-1">{menu.cornerName}</Text>
                                    ) : null}
                                    <SpicyLevel level={menu.spicyLevel} className="text-base mt-1" />
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
