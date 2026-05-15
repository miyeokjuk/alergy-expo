import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Dimensions, Animated } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import PagerView, {
    type PagerViewOnPageScrollEventData,
    type PagerViewOnPageSelectedEventData,
} from 'react-native-pager-view';
import '../global.css';
import { useAppStore } from '@/store/useAppStore';
import { normalizeAllergyValue } from '@/constants/allergyList';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import { SpicyLevel } from '@/components/ui/spicy-level';
import {
    getCafeterias,
    getWeeklyMeals,
    mapServerRiskLevel,
    type ServerMealSchedule,
} from '@/api/cafeteria';
import { useTranslation } from '@/lib/i18n';

// 메인 화면에 표시할 식당 순서 (왼쪽부터).
// 서버 명세 갱신: cafeteriaId 1=일품, 2=정찬, 3=분식
const DISPLAY_ORDER: number[] = [1, 2, 3];

type DisplayedCafeteria = {
    cafeteriaId: number;
    name: string;
};

const FALLBACK_CAFETERIAS: DisplayedCafeteria[] = [
    { cafeteriaId: 1, name: '일품식당' },
    { cafeteriaId: 2, name: '정찬식당' },
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

// 끼니 탭 (왼→오: Breakfast → Lunch → Dinner). Lunch가 디폴트(인덱스 1).
const MEAL_TYPES: readonly string[] = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
const DEFAULT_MEAL_INDEX = 1;
const TAB_BAR_HORIZONTAL_PADDING = 20;

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getMondayOfWeek(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return formatDate(d);
}

export default function HomeScreen() {
    const t = useTranslation();
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
        staleTime: 1000 * 60 * 60,
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
        staleTime: 1000 * 60 * 10,
    });

    // 선택된 날짜의 mealType별 schedule 매핑
    const schedulesByMealType = useMemo<Record<string, ServerMealSchedule | undefined>>(() => {
        const all = weeklyMealsResponse?.data?.mealSchedules ?? [];
        const result: Record<string, ServerMealSchedule | undefined> = {};
        for (const mealType of MEAL_TYPES) {
            result[mealType] = all.find((s) => s.mealDate === selectedDate && s.mealType === mealType);
        }
        return result;
    }, [weeklyMealsResponse, selectedDate]);

    // 날짜 버튼 (월~일 7일치)
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

    const navigation = useNavigation();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 오늘 날짜 위치로 가로 스크롤하는 공용 헬퍼
    const scrollDateListToToday = (animated: boolean) => {
        const todayIndex = weekDates.findIndex((item) => item.id === todayString);
        if (todayIndex < 0) return;
        timerRef.current = setTimeout(() => {
            const screenWidth = Dimensions.get('window').width;
            const itemWidth = 90;
            const offset = todayIndex * itemWidth - screenWidth / 2 + itemWidth / 2 + 20;
            dateScrollRef.current?.scrollTo({ x: offset, animated });
        }, 100);
    };

    // 첫 마운트 시 한 번만 — 오늘 날짜 위치로 즉시(애니메이션 없이) 스크롤
    useEffect(() => {
        scrollDateListToToday(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 탭 전환 시(다른 탭에서 메뉴 탭으로 올 때)만 오늘 날짜로 초기화 + 스크롤
    // meal-detail에서 뒤로가기로 돌아올 때는 'tabPress'가 발생하지 않으므로 영향 없음
    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress' as never, () => {
            setSelectedDate(todayString);
            scrollDateListToToday(true);
        });
        return () => {
            unsubscribe();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, todayString, weekDates]);

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

    // ─── 끼니 페이저 + 슬라이딩 밑줄 ───
    const pagerRef = useRef<PagerView>(null);
    const [activeMealIndex, setActiveMealIndex] = useState(DEFAULT_MEAL_INDEX);
    const scrollOffset = useRef(new Animated.Value(DEFAULT_MEAL_INDEX)).current;

    // 탭바 폭 측정. 화면폭 - 좌우 padding(20*2).
    const [tabBarWidth, setTabBarWidth] = useState(
        Dimensions.get('window').width - TAB_BAR_HORIZONTAL_PADDING * 2
    );
    const tabWidth = tabBarWidth / MEAL_TYPES.length;

    const onPageScroll = (e: { nativeEvent: PagerViewOnPageScrollEventData }) => {
        const { position, offset } = e.nativeEvent;
        scrollOffset.setValue(position + offset);
    };

    const onPageSelected = (e: { nativeEvent: PagerViewOnPageSelectedEventData }) => {
        setActiveMealIndex(e.nativeEvent.position);
    };

    const handleTabPress = (index: number) => {
        pagerRef.current?.setPage(index);
    };

    const indicatorTranslateX = scrollOffset.interpolate({
        inputRange: MEAL_TYPES.map((_, i) => i),
        outputRange: MEAL_TYPES.map((_, i) => i * tabWidth),
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView className="flex-1 bg-white pt-5">
            <View className="px-5 items-center mb-6">
                <Text className="text-3xl font-bold text-gray-800 mb-3">{t('main.title')}</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">
                        {t('main.currentFilter')}: {normalizedAllergies.join(', ') || t('common.none')}
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

            <View className="mb-4">
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

            {/* 끼니 탭 + 슬라이딩 밑줄 */}
            <View
                className="px-5"
                onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width - TAB_BAR_HORIZONTAL_PADDING * 2)}
            >
                <View className="flex-row">
                    {MEAL_TYPES.map((mealType, i) => {
                        const isActive = activeMealIndex === i;
                        return (
                            <TouchableOpacity
                                key={mealType}
                                className="flex-1 items-center py-3"
                                onPress={() => handleTabPress(i)}
                            >
                                <Text
                                    className={`text-base ${
                                        isActive ? 'font-bold text-gray-900' : 'font-semibold text-gray-400'
                                    }`}
                                >
                                    {t(`meal.${mealType.toLowerCase()}`)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View className="h-0.5 bg-gray-100">
                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            height: 2,
                            width: tabWidth,
                            backgroundColor: '#111827',
                            transform: [{ translateX: indicatorTranslateX }],
                        }}
                    />
                </View>
            </View>

            {/* 끼니별 페이저 */}
            <PagerView
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={DEFAULT_MEAL_INDEX}
                onPageScroll={onPageScroll}
                onPageSelected={onPageSelected}
            >
                {MEAL_TYPES.map((mealType) => {
                    const schedule = schedulesByMealType[mealType];
                    const sortedMenus = schedule
                        ? [...schedule.menus].sort((a, b) => a.displayOrder - b.displayOrder)
                        : [];

                    return (
                        <View key={mealType} style={{ flex: 1 }}>
                            <ScrollView
                                className="flex-1"
                                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
                            >
                                {!schedule ? (
                                    <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                                        <Text className="text-gray-700 text-lg font-bold">{t('main.cafeteriaClosed')}</Text>
                                        <Text className="text-gray-400 text-sm mt-2">
                                            {isWeeklyFetching ? t('common.loading') : t('main.noMealsScheduled')}
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="gap-3">
                                        {sortedMenus.map((menu) => {
                                            const riskLevel = mapServerRiskLevel(menu.risk);
                                            return (
                                                <TouchableOpacity
                                                    key={menu.mealMenuId}
                                                    className="rounded-2xl bg-gray-50 px-4 py-3 active:bg-gray-100"
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: '/meal-detail',
                                                            params: {
                                                                mealMenuId: String(menu.mealMenuId),
                                                                date: selectedDate,
                                                                cafeteriaId: String(selectedCafeteria?.cafeteriaId ?? ''),
                                                                cafeteriaName: selectedCafeteria?.name ?? '',
                                                                mealType,
                                                            },
                                                        })
                                                    }
                                                >
                                                    <View className="flex-row items-center justify-between">
                                                        <Text
                                                            className="text-base text-gray-800 font-semibold flex-1 pr-3"
                                                            numberOfLines={2}
                                                        >
                                                            {menu.menuName}
                                                            {menu.spicyLevel > 0 ? ' ' : ''}
                                                            {menu.spicyLevel > 0 ? (
                                                                <SpicyLevel level={menu.spicyLevel} />
                                                            ) : null}
                                                        </Text>
                                                        <RiskIndicator level={riskLevel} />
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    );
                })}
            </PagerView>
        </SafeAreaView>
    );
}
