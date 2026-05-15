import { useLocalSearchParams } from 'expo-router';
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import ReviewsBottomSheet from '@/components/reviews-bottom-sheet';
import ScreenHeader from '@/components/ui/screen-header';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import {
    getMenuDetail,
    mapServerRiskLevel,
    toggleMenuLike,
    type ServerMenuDetail,
} from '@/api/cafeteria';
import type { SuccessResponse } from '@/api/client';
import { getAllergyByCode } from '@/constants/allergyList';
import { useTranslation, t as tFn } from '@/lib/i18n';

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
    const t = useTranslation();
    const mealLabel = t(`meal.${mealType.toLowerCase()}`);

    const queryClient = useQueryClient();
    const queryKey = ['menuDetail', targetMealMenuId] as const;
    const reviewsSheetRef = useRef<BottomSheetModal>(null);

    const { data: menuDetailResponse, isLoading } = useQuery({
        queryKey,
        queryFn: () => getMenuDetail(targetMealMenuId),
        enabled: Number.isFinite(targetMealMenuId),
        staleTime: 1000 * 60 * 10,
    });

    const menu = menuDetailResponse?.data ?? null;
    // matchedAllergies가 객체 배열이라 코드만 추출해 Set 구성.
    // ingredientCode가 있으면 그걸 우선, 없으면 allergyCode로 매칭 (ingredient.code와 비교)
    const matchedSet = new Set(
        (menu?.matchedAllergies ?? []).map((m) => m.ingredientCode ?? m.allergyCode)
    );

    const liked = Boolean(menu?.like?.likedByMe);
    const likeCount = Number(menu?.like?.count) || 0;
    const reviewCount = Number(menu?.review?.count) || 0;

    const [isTogglingLike, setIsTogglingLike] = useState(false);

    const showComingSoon = (label: string) =>
        Alert.alert(tFn('common.comingSoon'), tFn('common.comingSoonMessage', { label }));

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
            Alert.alert(tFn('detail.likeFailed'), error?.message ?? tFn('common.tryAgain'));
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
                                {isLoading ? t('common.loading') : t('detail.notFound')}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* === 카드 (콘텐츠만, 헤더 행 제거됨) === */}
                        <View
                            className="mx-4 mt-2 rounded-3xl bg-orange-50 px-6 py-8"
                            style={{ minHeight: 380 }}
                        >
                            {/* 콘텐츠 영역 (구조화 레이아웃) */}
                            <View style={{ gap: 16 }}>
                                {/* Row 1: menuName + spicyLevel | riskLevel — 카드 맨 위 */}
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

                                {/* Row 3: ingredients ({code, source} 객체 배열).
                                    matchedAllergies는 코드 배열이라 ingredient.code로 매칭 */}
                                {menu.ingredients.length > 0 ? (
                                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                        {menu.ingredients.map((ingredient) => {
                                            const isMatched = matchedSet.has(ingredient.code);
                                            const label =
                                                getAllergyByCode(ingredient.code)?.label ??
                                                ingredient.code;
                                            return (
                                                <View
                                                    key={ingredient.code}
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
                                                        {label}
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
                                onPress={() => reviewsSheetRef.current?.present()}
                                disabled={!Number.isFinite(targetMealMenuId)}
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

            {/* 리뷰 Bottom Sheet — Reviews 버튼 누르면 슬라이드 업 */}
            <ReviewsBottomSheet ref={reviewsSheetRef} mealMenuId={targetMealMenuId} />
        </SafeAreaView>
    );
}
