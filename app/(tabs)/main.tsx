import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import '../global.css';
import { useAppStore } from '@/store/useAppStore';
import { normalizeAllergyValue } from '@/constants/allergyList';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import {
    getCafeterias,
    getWeeklyMeals,
    mapServerRiskLevel,
    MEAL_TYPE_LABEL,
    MEAL_TYPE_ORDER,
    type ServerMealSchedule,
} from '@/api/cafeteria';

// 메인 화면에 표시할 식당 순서 (왼쪽부터). 1·2번 cafeteriaId는 사용 안 하는 구식당.
const DISPLAY_ORDER: number[] = [4, 5, 3]; // 일품식당, 정찬식당, 분식당

type DisplayedCafeteria = {
    cafeteriaId: number;
    name: string;
};

const FALLBACK_CAFETERIAS: DisplayedCafeteria[] = [
    { cafeteriaId: 4, name: '일품식당' },
    { cafeteriaId: 5, name: '정찬식당' },
    { cafeteriaId: 3, name: '분식당' },
];

const ITEM_WIDTH = 80;
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const DISPLAY_DAY_NAMES: Record<string, string> = {
    일: 'Sun',
    월: 'Mon',
    화: 'Tue',
    수: 'Wed',
    목: 'Thu',
    금: 'Fri',
    토: 'Sat',
};

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getMondayOfWeek(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // 일요일(0)이면 직전 월요일까지 -6
    d.setDate(d.getDate() + diff);
    return formatDate(d);
}

export default function HomeScreen() {
    const allergies = useAppStore((state) => state.allergies);
    const normalizedAllergies = useMemo(
        () => Array.from(new Set(allergies.map((allergy) => normalizeAllergyValue(allergy)))),
        [allergies]
    );

    const dateScrollRef = useRef<ScrollView>(null);

    const today = useMemo(() => new Date(), []);
    const todayString = formatDate(today);
    const weekStartDate = useMemo(() => getMondayOfWeek(today), [today]);

    const [selectedDate, setSelectedDate] = useState(todayString);

    // 식당 목록
    const { data: cafeteriasResponse } = useQuery({
        queryKey: ['cafeterias'],
        queryFn: getCafeterias,
        staleTime: 1000 * 60 * 60, // 1h
    });

    const displayedCafeterias: DisplayedCafeteria[] = useMemo(() => {
        const serverList = cafeteriasResponse?.data?.cafeterias;
        if (!serverList || serverList.length === 0) {
            return FALLBACK_CAFETERIAS;
        }
        return DISPLAY_ORDER.map((id) => serverList.find((c) => c.cafeteriaId === id))
            .filter((c): c is NonNullable<typeof c> => Boolean(c))
            .map((c) => ({ cafeteriaId: c.cafeteriaId, name: c.name }));
    }, [cafeteriasResponse]);

    const [selectedCafeteriaId, setSelectedCafeteriaId] = useState<number | null>(null);

    useEffect(() => {
        if (selectedCafeteriaId !== null) return;
        if (displayedCafeterias.length === 0) return;
        setSelectedCafeteriaId(displayedCafeterias[0].cafeteriaId);
    }, [displayedCafeterias, selectedCafeteriaId]);

    const selectedCafeteria = useMemo(
        () => displayedCafeterias.find((c) => c.cafeteriaId === selectedCafeteriaId),
        [displayedCafeterias, selectedCafeteriaId]
    );

    // 주간 식단
    const { data: weeklyMealsResponse, isFetching: isWeeklyFetching } = useQuery({
        queryKey: ['weeklyMeals', selectedCafeteriaId, weekStartDate],
        queryFn: () => getWeeklyMeals(selectedCafeteriaId as number, weekStartDate),
        enabled: selectedCafeteriaId !== null,
        staleTime: 1000 * 60 * 10, // 10분
    });

    const schedulesForSelectedDate = useMemo<ServerMealSchedule[]>(() => {
        const all = weeklyMealsResponse?.data?.mealSchedules ?? [];
        return [...all]
            .filter((s) => s.mealDate === selectedDate)
            .sort((a, b) => (MEAL_TYPE_ORDER[a.mealType] ?? 99) - (MEAL_TYPE_ORDER[b.mealType] ?? 99));
    }, [weeklyMealsResponse, selectedDate]);

    // 날짜 버튼용 (월~일 7일치)
    const weekDates = useMemo(() => {
        const dates = [];
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + diffToMonday + i);

            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            dates.push({
                id: formatDate(date),
                dayName: DAY_NAMES[date.getDay()],
                displayDate: `${month}.${day}`,
            });
        }
        return dates;
    }, [today]);

    // 메인으로 복귀 시 오늘 날짜로 스크롤
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useFocusEffect(
        useCallback(() => {
            setSelectedDate(todayString);
            const todayIndex = weekDates.findIndex((item) => item.id === todayString);
            if (todayIndex >= 0) {
                timerRef.current = setTimeout(() => {
                    const screenWidth = Dimensions.get('window').width;
                    const itemWidth = 90;
                    const offset = todayIndex * itemWidth - screenWidth / 2 + itemWidth / 2 + 20;
                    dateScrollRef.current?.scrollTo({ x: offset, animated: true });
                }, 100);
            }
            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }, [todayString, weekDates])
    );

    const handleDatePress = (newDateId: string) => {
        const newIndex = weekDates.findIndex((item) => item.id === newDateId);
        const screenWidth = Dimensions.get('window').width;
        const itemWidth = 90;
        const gap = 10;
        const totalWidth = itemWidth + gap;
        const offset = newIndex * totalWidth - screenWidth / 2 + itemWidth / 2 + 20;

        dateScrollRef.current?.scrollTo({ x: offset, animated: true });
        setSelectedDate(newDateId);
    };

    return (
        <SafeAreaView className="flex-1 bg-white pt-5">
            <View className="px-5 items-center mb-6">
                <Text className="text-3xl font-bold text-gray-800 mb-3">Today&apos;s Campus Menu 🍽️</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">
                        Current filter: {normalizedAllergies.join(', ') || 'None'}
                    </Text>
                </View>
            </View>

            <View className="mb-6">
                <ScrollView
                    ref={dateScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                >
                    {weekDates.map((item) => {
                        const isSelected = selectedDate === item.id;
                        const isToday = item.id === todayString;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleDatePress(item.id)}
                                className={`items-center justify-center py-1 rounded-2xl border-2 ${
                                    isSelected ? 'border-black bg-black' : 'border-gray-200 bg-white'
                                }`}
                                style={{ width: ITEM_WIDTH }}
                            >
                                <Text className={`text-lg font-semibold mb-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {DISPLAY_DAY_NAMES[item.dayName]}
                                </Text>
                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {item.displayDate}
                                </Text>
                                {isToday && (
                                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View className="mb-6">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                >
                    {displayedCafeterias.map((item) => {
                        const isSelected = selectedCafeteriaId === item.cafeteriaId;
                        return (
                            <TouchableOpacity
                                key={item.cafeteriaId}
                                className={`items-center justify-center py-3 px-5 rounded-2xl border-2 ${
                                    isSelected ? 'border-black bg-black' : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => setSelectedCafeteriaId(item.cafeteriaId)}
                            >
                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                {schedulesForSelectedDate.length === 0 ? (
                    <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                        <Text className="text-gray-700 text-lg font-bold">식당 미운영</Text>
                        <Text className="text-gray-400 text-sm mt-2">
                            {isWeeklyFetching ? 'Loading...' : 'No meals scheduled for this date'}
                        </Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {schedulesForSelectedDate.map((schedule) => {
                            const sortedMenus = [...schedule.menus].sort(
                                (a, b) => a.displayOrder - b.displayOrder
                            );
                            return (
                                <TouchableOpacity
                                    key={schedule.mealType}
                                    className="rounded-3xl border border-gray-200 bg-white px-5 py-4 active:bg-gray-50"
                                    onPress={() =>
                                        router.push({
                                            pathname: '/meal-detail',
                                            params: {
                                                date: selectedDate,
                                                cafeteriaId: String(selectedCafeteria?.cafeteriaId ?? ''),
                                                cafeteriaName: selectedCafeteria?.name ?? '',
                                                mealType: schedule.mealType,
                                            },
                                        })
                                    }
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <Text className="text-xl font-bold text-gray-900">
                                            {MEAL_TYPE_LABEL[schedule.mealType] ?? schedule.mealType}
                                        </Text>
                                        <Text className="text-sm font-semibold text-gray-400">Details</Text>
                                    </View>
                                    <View className="gap-2">
                                        {sortedMenus.map((menu) => {
                                            const riskLevel = mapServerRiskLevel(menu.risk?.riskLevel);
                                            return (
                                                <View
                                                    key={menu.mealMenuId}
                                                    className="rounded-2xl bg-gray-50 px-4 py-3 flex-row items-center justify-between"
                                                >
                                                    <Text className="text-base text-gray-700 flex-1 pr-3">
                                                        {menu.menuName}
                                                    </Text>
                                                    <RiskIndicator level={riskLevel} />
                                                </View>
                                            );
                                        })}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
