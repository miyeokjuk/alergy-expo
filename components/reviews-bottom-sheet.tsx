import { memo, useCallback, useMemo, useState, type Ref } from 'react';
import { Alert, ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetTextInput,
    BottomSheetFooter,
    type BottomSheetBackdropProps,
    type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useInfiniteQuery,
    useQueryClient,
    type InfiniteData,
} from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewLike,
    type ServerReview,
    type ReviewsListData,
} from '@/api/review';
import type { SuccessResponse } from '@/api/client';
import { useTranslation, t as tFn } from '@/lib/i18n';

type ReviewsQueryData = InfiniteData<SuccessResponse<ReviewsListData>>;

const PAGE_SIZE = 20;

interface Props {
    mealMenuId: number;
    // React 19부터는 ref도 일반 prop처럼 받는다. forwardRef 불필요.
    ref?: Ref<BottomSheetModal>;
}

function ReviewsBottomSheet({ mealMenuId, ref }: Props) {
        const t = useTranslation();
        const queryClient = useQueryClient();
        const insets = useSafeAreaInsets();

        // 입력창은 footerComponent로 항상 시트 하단에 고정되므로,
        // 시트 자체는 50% / 85% 두 단계로 충분.
        // ⚠️ enableDynamicSizing=false 와 함께 써야 snap이 strict하게 지켜진다.
        const snapPoints = useMemo(() => ['50%', '85%'], []);
        // FlatList 마지막 항목이 입력창 뒤로 숨지 않도록 패딩 확보용 footer 높이 추정.
        const FOOTER_HEIGHT = 64;
        const reviewsKey = ['reviews', mealMenuId] as const;

        const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            refetch,
        } = useInfiniteQuery({
            queryKey: reviewsKey,
            queryFn: ({ pageParam }) => getReviews(mealMenuId, pageParam, PAGE_SIZE),
            initialPageParam: 0,
            getNextPageParam: (lastPage) =>
                lastPage?.data?.page?.hasNext
                    ? lastPage.data.page.page + 1
                    : undefined,
            enabled: mealMenuId > 0,
            staleTime: 1000 * 30,
        });

        const allReviews: ServerReview[] =
            data?.pages.flatMap((page) => page?.data?.reviews ?? []) ?? [];

        // 인라인 수정 상태
        const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
        const [editingContent, setEditingContent] = useState('');
        const [isSavingEdit, setIsSavingEdit] = useState(false);

        const invalidateMenuDetail = useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ['menuDetail', mealMenuId] });
        }, [queryClient, mealMenuId]);

        // 작성 후처리(목록 갱신 + 메뉴 상세 리뷰 카운트 갱신)
        const handleAfterCreate = useCallback(async () => {
            await refetch();
            invalidateMenuDetail();
        }, [refetch, invalidateMenuDetail]);

        const handleEditStart = (review: ServerReview) => {
            setEditingReviewId(review.reviewId);
            setEditingContent(review.content);
        };

        const handleEditCancel = () => {
            setEditingReviewId(null);
            setEditingContent('');
        };

        const handleEditSave = async () => {
            if (editingReviewId === null) return;
            const trimmed = editingContent.trim();
            if (!trimmed || isSavingEdit) return;
            setIsSavingEdit(true);
            try {
                await updateReview(mealMenuId, editingReviewId, trimmed);
                setEditingReviewId(null);
                setEditingContent('');
                await refetch();
            } catch (error: any) {
                Alert.alert(
                    tFn('review.updateFailed'),
                    error?.message ?? tFn('common.tryAgain')
                );
            } finally {
                setIsSavingEdit(false);
            }
        };

        const handleDelete = (reviewId: number) => {
            Alert.alert(
                tFn('review.deleteConfirm'),
                tFn('review.deleteConfirmMessage'),
                [
                    { text: tFn('review.cancel'), style: 'cancel' },
                    {
                        text: tFn('review.delete'),
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await deleteReview(mealMenuId, reviewId);
                                await refetch();
                                invalidateMenuDetail();
                            } catch (error: any) {
                                Alert.alert(
                                    tFn('review.deleteFailed'),
                                    error?.message ?? tFn('common.tryAgain')
                                );
                            }
                        },
                    },
                ]
            );
        };

        const updateReviewInCache = useCallback(
            (reviewId: number, updater: (r: ServerReview) => ServerReview) => {
                queryClient.setQueryData<ReviewsQueryData>(reviewsKey, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: {
                                ...page.data,
                                reviews: page.data.reviews.map((r) =>
                                    r.reviewId === reviewId ? updater(r) : r
                                ),
                            },
                        })),
                    };
                });
            },
            [queryClient, reviewsKey]
        );

        const handleLikeToggle = async (review: ServerReview) => {
            const prev = { likedByMe: review.likedByMe, likeCount: review.likeCount };
            updateReviewInCache(review.reviewId, (r) => ({
                ...r,
                likedByMe: !r.likedByMe,
                likeCount: r.likedByMe ? Math.max(0, r.likeCount - 1) : r.likeCount + 1,
            }));

            try {
                const response = await toggleReviewLike(review.reviewId);
                const d = response?.data;
                if (d) {
                    updateReviewInCache(review.reviewId, (r) => ({
                        ...r,
                        likedByMe: Boolean(d.likedByMe),
                        likeCount: Number.isFinite(d.likeCount) ? d.likeCount : r.likeCount,
                    }));
                }
            } catch (error: any) {
                updateReviewInCache(review.reviewId, (r) => ({
                    ...r,
                    likedByMe: prev.likedByMe,
                    likeCount: prev.likeCount,
                }));
                Alert.alert(
                    tFn('review.likeFailed'),
                    error?.message ?? tFn('common.tryAgain')
                );
            }
        };

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.4}
                    pressBehavior="close"
                />
            ),
            []
        );

        // 입력창을 시트 하단에 항상 고정. 리뷰가 없거나 많거나 무관.
        // BottomSheetFooter는 시트 내부 absolute 위치를 자동 계산하며, 키보드 등장 시 함께 올라간다.
        //
        // ⚠️ renderFooter 콜백의 의존성에 입력값 state를 넣으면 글자 입력마다
        // footerComponent 가 unmount/remount 되어 IME 포커스가 풀린다 (한글 첫 자만 입력되는 버그).
        // → 입력 state는 ReviewComposer 내부에서 관리하고, renderFooter 는 안정 prop만 받는다.
        const renderFooter = useCallback(
            (props: BottomSheetFooterProps) => (
                <BottomSheetFooter {...props} bottomInset={0}>
                    <ReviewComposer
                        mealMenuId={mealMenuId}
                        insetBottom={insets.bottom}
                        onCreated={handleAfterCreate}
                    />
                </BottomSheetFooter>
            ),
            [mealMenuId, insets.bottom, handleAfterCreate]
        );

        const renderItem = ({ item: review }: { item: ServerReview }) => {
            const isEditing = editingReviewId === review.reviewId;
            const isEdited = review.createdAt !== review.updatedAt;

            return (
                <View className="px-4 py-3 border-b border-gray-100">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1 pr-3">
                            <Text
                                className="text-sm font-semibold text-gray-900"
                                numberOfLines={1}
                            >
                                {review.writerName}
                                {review.mine ? ` ${t('review.mineSuffix')}` : ''}
                            </Text>
                            <Text className="text-xs text-gray-400 ml-2">
                                · {review.mealDate}
                                {isEdited ? ` · ${t('review.edited')}` : ''}
                            </Text>
                        </View>
                        {review.mine && !isEditing ? (
                            <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => handleEditStart(review)}>
                                    <Ionicons name="pencil-outline" size={18} color="#6B7280" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(review.reviewId)}>
                                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>

                    {isEditing ? (
                        <View>
                            <BottomSheetTextInput
                                value={editingContent}
                                onChangeText={setEditingContent}
                                multiline
                                autoFocus
                                style={{
                                    minHeight: 60,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    backgroundColor: '#F9FAFB',
                                    paddingHorizontal: 12,
                                    paddingTop: 8,
                                    paddingBottom: 8,
                                    fontSize: 16,
                                    color: '#111827',
                                }}
                            />
                            <View className="flex-row gap-2 mt-2 justify-end">
                                <TouchableOpacity
                                    onPress={handleEditCancel}
                                    disabled={isSavingEdit}
                                    className="rounded-full px-3 py-1.5 bg-gray-100"
                                >
                                    <Text className="text-sm font-semibold text-gray-700">
                                        {t('review.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleEditSave}
                                    disabled={isSavingEdit || !editingContent.trim()}
                                    className={`rounded-full px-3 py-1.5 ${
                                        isSavingEdit || !editingContent.trim()
                                            ? 'bg-blue-300'
                                            : 'bg-blue-500'
                                    }`}
                                >
                                    <Text className="text-sm font-semibold text-white">
                                        {t('review.save')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text className="text-base text-gray-800 leading-6 mt-0.5">
                            {review.content}
                        </Text>
                    )}

                    {!isEditing ? (
                        <View className="flex-row items-center gap-4 mt-2">
                            <TouchableOpacity
                                onPress={() => handleLikeToggle(review)}
                                className="flex-row items-center"
                            >
                                <Ionicons
                                    name={review.likedByMe ? 'heart' : 'heart-outline'}
                                    size={18}
                                    color={review.likedByMe ? '#ef4444' : '#6B7280'}
                                />
                                {review.likeCount > 0 ? (
                                    <Text
                                        className={`ml-1 text-sm ${
                                            review.likedByMe ? 'text-red-500' : 'text-gray-600'
                                        }`}
                                    >
                                        {review.likeCount}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                            <View className="flex-row items-center">
                                <Ionicons name="chatbubble-outline" size={17} color="#6B7280" />
                                {review.commentCount > 0 ? (
                                    <Text className="ml-1 text-sm text-gray-600">
                                        {review.commentCount}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    ) : null}
                </View>
            );
        };

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                index={0}
                enablePanDownToClose
                // strict snap: 콘텐츠 크기에 맞춰 시트가 임의로 커지지 않도록.
                // 이 옵션 없으면 v5 기본값(true)이라 snapPoints가 사실상 max로만 동작.
                enableDynamicSizing={false}
                // 콘텐츠 영역 드래그 = 스크롤 (시트 이동은 핸들/헤더로만).
                // 이게 false라야 50%/85% 어느 위치에서든 리뷰 목록이 바로 스크롤됨.
                enableContentPanningGesture={false}
                // 상단 status bar 영역 침범 방지.
                topInset={insets.top}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                backdropComponent={renderBackdrop}
                footerComponent={renderFooter}
                backgroundStyle={{
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                }}
                handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
            >
                {/* 헤더 (제목) */}
                <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-900">
                        {t('review.title')}
                    </Text>
                </View>

                {/* 리뷰 목록 — 마지막 항목이 footer(입력창) 뒤로 숨지 않도록 충분한 하단 패딩 */}
                <BottomSheetFlatList
                    data={allReviews}
                    keyExtractor={(item) => String(item.reviewId)}
                    renderItem={renderItem}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-4 items-center">
                                <ActivityIndicator size="small" color="#6B7280" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        isLoading ? (
                            <View className="py-20 items-center">
                                <ActivityIndicator size="small" color="#6B7280" />
                            </View>
                        ) : (
                            <View className="py-20 items-center px-8">
                                <Ionicons
                                    name="chatbubbles-outline"
                                    size={40}
                                    color="#D1D5DB"
                                />
                                <Text className="text-gray-500 text-center mt-3">
                                    {t('review.empty')}
                                </Text>
                            </View>
                        )
                    }
                    contentContainerStyle={{
                        paddingBottom: FOOTER_HEIGHT + insets.bottom + 16,
                    }}
                />
            </BottomSheetModal>
        );
}

/* ──────────────────────────────────────────────────────────────────────────
 * ReviewComposer — 시트 footer에 들어가는 입력창.
 * 자체 state로 입력을 관리해서, 글자 입력마다 부모(renderFooter)가
 * 다시 렌더되지 않도록 격리한다 (IME 한글 입력 안정성 확보).
 * ────────────────────────────────────────────────────────────────────────── */
interface ReviewComposerProps {
    mealMenuId: number;
    insetBottom: number;
    onCreated: () => void | Promise<void>;
}

const ReviewComposer = memo(function ReviewComposer({
    mealMenuId,
    insetBottom,
    onCreated,
}: ReviewComposerProps) {
    const t = useTranslation();
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        const trimmed = content.trim();
        if (!trimmed || submitting) return;
        setSubmitting(true);
        try {
            await createReview(mealMenuId, trimmed);
            setContent('');
            await onCreated();
        } catch (error: any) {
            Alert.alert(
                tFn('review.createFailed'),
                error?.message ?? tFn('common.tryAgain')
            );
        } finally {
            setSubmitting(false);
        }
    };

    const disabled = submitting || !content.trim();

    return (
        <View
            style={{
                borderTopWidth: 1,
                borderTopColor: '#F3F4F6',
                backgroundColor: 'white',
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 12 + insetBottom,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
            }}
        >
            <BottomSheetTextInput
                value={content}
                onChangeText={setContent}
                placeholder={t('review.placeholder')}
                placeholderTextColor="#9CA3AF"
                multiline
                style={{
                    flex: 1,
                    minHeight: 44,
                    maxHeight: 120,
                    borderRadius: 24,
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 16,
                    paddingTop: Platform.OS === 'ios' ? 12 : 10,
                    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
                    fontSize: 16,
                    color: '#111827',
                    lineHeight: 20,
                }}
            />
            <TouchableOpacity
                onPress={submit}
                disabled={disabled}
                style={{
                    height: 44,
                    paddingHorizontal: 20,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: disabled ? '#93C5FD' : '#3B82F6',
                }}
            >
                <Text className="text-white font-semibold text-base">
                    {t('review.send')}
                </Text>
            </TouchableOpacity>
        </View>
    );
});

export default ReviewsBottomSheet;
