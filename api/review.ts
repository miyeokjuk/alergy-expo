import { requestJson } from '@/api/client';

export interface ServerReview {
    reviewId: number;
    writerName: string;
    content: string;
    mealDate: string;
    likeCount: number;
    commentCount: number;
    likedByMe: boolean;
    mine: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewPageInfo {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface ReviewsListData {
    mealMenuId: number;
    cafeteriaId: number;
    menuId: number;
    reviewCount: number;
    reviews: ServerReview[];
    page: ReviewPageInfo;
}

export interface SingleReviewData extends ServerReview {
    mealMenuId: number;
    cafeteriaId: number;
    menuId: number;
}

export interface ReviewLikeResponse {
    reviewId: number;
    likeCount: number;
    likedByMe: boolean;
}

// 리뷰 목록 (페이지네이션)
export async function getReviews(mealMenuId: number, page: number, size = 20) {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    return requestJson<ReviewsListData>(
        `/api/v1/meal-menus/${mealMenuId}/reviews?${params.toString()}`,
        { method: 'GET' }
    );
}

// 리뷰 작성
export async function createReview(mealMenuId: number, content: string) {
    return requestJson<SingleReviewData>(
        `/api/v1/meal-menus/${mealMenuId}/reviews`,
        { method: 'POST', body: JSON.stringify({ content }) }
    );
}

// 리뷰 수정
export async function updateReview(
    mealMenuId: number,
    reviewId: number,
    content: string
) {
    return requestJson<SingleReviewData>(
        `/api/v1/meal-menus/${mealMenuId}/reviews/${reviewId}`,
        { method: 'PATCH', body: JSON.stringify({ content }) }
    );
}

// 리뷰 삭제 (soft delete)
export async function deleteReview(mealMenuId: number, reviewId: number) {
    return requestJson<null>(
        `/api/v1/meal-menus/${mealMenuId}/reviews/${reviewId}`,
        { method: 'DELETE' }
    );
}

// 리뷰 좋아요 토글
export async function toggleReviewLike(reviewId: number) {
    return requestJson<ReviewLikeResponse>(
        `/api/v1/reviews/${reviewId}/like`,
        { method: 'POST' }
    );
}
