import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

interface AuthData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    onboardingCompleted: boolean;
}

interface ErrorResponse {
    success: string;
    code: string;
    msg: string;
}

interface LoginResponse {
    success: string;
    data: AuthData;
}

interface RefreshResponse {
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
    accessToken?: string;
    refreshToken?: string;
}

export interface SessionRestoreResult {
    isValid: boolean;
    onboardingCompleted?: boolean;
}

export const loginWithGoogleToken = async (idToken: string, deviceId: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, deviceId }),
    });
    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ErrorResponse;
        const baseMessage = errorData.msg ?? `서버 응답 오류: ${response.status}`;
        const errorMessage = errorData.code
            ? `[${errorData.code}] ${baseMessage}`
            : baseMessage;
        throw new Error(errorMessage);
    }

    const result = (await response.json()) as LoginResponse;
    const { accessToken, refreshToken } = result.data;

    if (!accessToken) {
        throw new Error('서버에서 토큰을 받지 못했습니다. 다시 시도해 주세요');
    }

    await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    }
    console.log('JWT 발급 완료');
    return result.data;
};

// 동시에 여러 401 요청이 들어와도 refresh는 한 번만 수행되도록 single-flight
let pendingRefresh: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
    if (pendingRefresh) return pendingRefresh;

    pendingRefresh = (async (): Promise<string | null> => {
        try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) return null;

            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) return null;

            const payload = (await response.json().catch(() => ({}))) as RefreshResponse;
            const newAccessToken = payload?.data?.accessToken ?? payload?.accessToken;
            const newRefreshToken = payload?.data?.refreshToken ?? payload?.refreshToken;

            if (!newAccessToken) return null;

            await SecureStore.setItemAsync('accessToken', newAccessToken);
            if (newRefreshToken) {
                await SecureStore.setItemAsync('refreshToken', newRefreshToken);
            }
            console.log('토큰 갱신 성공');
            return newAccessToken;
        } catch (error) {
            console.warn('refreshAccessToken failed:', error);
            return null;
        }
    })().finally(() => {
        pendingRefresh = null;
    });

    return pendingRefresh;
}

// 자동 로그인 검사: SecureStore에 accessToken이 있으면 일단 로그인 상태로 간주.
// 실제 토큰 유효성은 후속 API 호출(authedFetch)에서 lazy하게 검증되며,
// 401 + refresh 실패 시 client.ts의 onAuthExpired 콜백이 강제 로그아웃을 트리거한다.
export const verifyAndRestoreSession = async (): Promise<SessionRestoreResult> => {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (!accessToken) return { isValid: false };

        return { isValid: true };
    } catch (error) {
        console.warn('자동 로그인 검사 중 에러:', error);
        return { isValid: false };
    }
};

// 서버에 로그아웃 통지 (refresh token 무효화). 실패해도 best-effort라 throw 안 함.
export const logoutFromServer = async (): Promise<void> => {
    try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return;

        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
    } catch (error) {
        console.warn('logoutFromServer failed:', error);
    }
};
