import { useLocalSearchParams } from 'expo-router';
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ui/screen-header';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import {
    getMenuDetail,
    mapServerRiskLevel,
    toggleMenuLike,
    MEAL_TYPE_LABEL,
    type ServerMenuDetail,
} from '@/api/cafeteria';
import type { SuccessResponse } from '@/api/client';

type MenuDetailData = SuccessResponse<ServerMenuDetail> | undefined;

export default function MealDetailScreen() {
    const params = useLocalSearchParams<{
        mealMenuId?: string;
        date?: string;
        cafeteriaId?: string;
        cafeteriaName?: string;
        mealType?: string;
    }>();

    const targetMealMenuId = parseInt(String(params.mealMenuId ?? ''), 10);
    const mealType = String(params.mealType ?? 'LUNCH');
    const mealLabel = MEAL_TYPE_LABEL[mealType] ?? mealType;

    const queryClient = useQueryClient();
    const queryKey = ['menuDetail', targetMealMenuId] as const;

    const { data: menuDetailResponse, isLoading } = useQuery({
        queryKey,
        queryFn: () => getMenuDetail(targetMealMenuId),
        enabled: Number.isFinite(targetMealMenuId),
        staleTime: 1000 * 60 * 10,
    });

    const menu = menuDetailResponse?.data ?? null;
    const matchedSet = new Set(menu?.matchedAllergies ?? []);

    const liked = Boolean(menu?.like?.likedByMe);
    const likeCount = Number(menu?.like?.count) || 0;
    const reviewCount = Number(menu?.review?.count) || 0;

    const [isTogglingLike, setIsTogglingLike] = useState(false);

    const showComingSoon = (label: string) =>
        Alert.alert('Coming soon', `${label}는 준비 중입니다.`);

    const handleToggleLike = async () => {
        if (isTogglingLike) return;
        if (!Number.isFinite(targetMealMenuId)) return;
        if (!menu) return;

        const oldLike = menu.like ?? { count: 0, likedByMe: false };
        const optimisticLike = {
            likedByMe: !oldLike.likedByMe,
            count: oldLike.likedByMe
                ? Math.max(0, oldLike.count - 1)
                : oldLike.count + 1,
        };

        queryClient.setQueryData<MenuDetailData>(queryKey, (old) => {
            if (!old) return old;
            return { ...old, data: { ...old.data, like: optimisticLike } };
        });
        setIsTogglingLike(true);

        try {
            const response = await toggleMenuLike(targetMealMenuId);
            const data = response?.data;
            if (data) {
                queryClient.setQueryData<MenuDetailData>(queryKey, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            like: {
                                count: Number.isFinite(data.likeCount)
                                    ? data.likeCount
                                    : optimisticLike.count,
                                likedByMe: Boolean(data.likedByMe),
                            },
                        },
                    };
                });
            }
        } catch (error: any) {
            queryClient.setQueryData<MenuDetailData>(queryKey, (old) => {
                if (!old) return old;
                return { ...old, data: { ...old.data, like: oldLike } };
            });
            Alert.alert('Like failed', error?.message ?? 'Please try again.');
        } finally {
            setIsTogglingLike(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="" />

            <ScrollView className="flex-1">
                {!menu ? (
                    <View className="px-5 mt-10">
                        <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                            <Text className="text-gray-700 text-lg font-bold">
                                {isLoading ? 'Loading...' : '메뉴 정보를 찾을 수 없습니다'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* === 단일 카드 (헤더 + 콘텐츠 영역) === */}
                        <View
                            className="mx-4 mt-2 rounded-3xl bg-orange-50 px-6 py-8"
                            style={{ minHeight: 380 }}
                        >
                            {/* Header row (계정행 스타일) */}
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
                                    <Text className="text-2xl">🍽️</Text>
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text
                                        className="text-base font-semibold text-gray-900"
                                        numberOfLines={1}
                                    >
                                        {menu.menuName}
                                    </Text>
                                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                                        {menu.cornerName}
                                        {menu.cornerName ? ' · ' : ''}
                                        {mealLabel}
                                    </Text>
                                </View>
                            </View>

                            {/* 콘텐츠 영역 (구조화 레이아웃) */}
                            <View className="mt-6" style={{ gap: 16 }}>
                                {/* Row 1: menuName + spicyLevel | riskLevel */}
                                <View className="flex-row items-center">
                                    <Text
                                        className="text-xl font-bold text-gray-900 flex-1 pr-3"
                                        numberOfLines={2}
                                    >
                                        {menu.menuName}
                                        {menu.spicyLevel > 0
                                            ? ` ${'🌶️'.repeat(menu.spicyLevel)}`
                                            : ''}
                                    </Text>
                                    <RiskIndicator level={mapServerRiskLevel(menu.risk)} />
                                </View>

                                {/* Row 2: description */}
                                {menu.description ? (
                                    <Text className="text-base text-gray-700 leading-6">
                                        {menu.description}
                                    </Text>
                                ) : null}

                                {/* Row 3: ingredients (matchedAllergies는 빨간색 강조) */}
                                {menu.ingredients.length > 0 ? (
                                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                        {menu.ingredients.map((ingredient) => {
                                            const isMatched = matchedSet.has(ingredient);
                                            return (
                                                <View
                                                    key={ingredient}
                                                    className={`rounded-full px-3 py-1.5 border ${
                                                        isMatched
                                                            ? 'bg-red-100 border-red-300'
                                                            : 'bg-white border-gray-200'
                                                    }`}
                                                >
                                                    <Text
                                                        className={
                                                            isMatched
                                                                ? 'text-red-700 font-semibold'
                                                                : 'text-gray-700'
                                                        }
                                                    >
                                                        {ingredient}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {/* === ACTION ROW (Instagram-style) === */}
                        <View className="flex-row items-center px-4 py-3" style={{ gap: 20 }}>
                            <TouchableOpacity
                                onPress={handleToggleLike}
                                disabled={isTogglingLike}
                                className="flex-row items-center"
                            >
                                <Ionicons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={28}
                                    color={liked ? '#ef4444' : '#000'}
                                />
                                {likeCount > 0 ? (
                                    <Text className="ml-1.5 text-base font-semibold text-gray-900">
                                        {likeCount}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => showComingSoon('Reviews')}
                                className="flex-row items-center"
                            >
                                <Ionicons name="chatbubble-outline" size={26} color="#000" />
                                {reviewCount > 0 ? (
                                    <Text className="ml-1.5 text-base font-semibold text-gray-900">
                                        {reviewCount}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
