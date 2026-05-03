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
    success: string; // boolean 아님
    data: AuthData;
}

export const loginWithGoogleToken = async (idToken: string, deviceId: string) => {

    // ⭐️ 토큰을 body에 담아 전송
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            idToken,
            deviceId,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ErrorResponse;
        const baseMessage = errorData.msg ?? `서버 응답 오류: ${response.status}`;
        const errorMessage = errorData.code
            ? `[${errorData.code}] ${baseMessage}`
            : baseMessage;
        throw new Error(errorMessage);
    }

    // JWT 받기
    const result = await response.json() as LoginResponse;
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

export const verifyAndRestoreSession = async (): Promise<boolean> => {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!accessToken) return false; // 토큰이 없으면 실패


        const response = await fetch(`${API_URL}/api/user/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            console.log("액세스 토큰이 아직 쌩쌩합니다!");
            return true;
        }

        if (response.status === 401 && refreshToken) {
            console.log("액세스 토큰 만료됨. 리프레시 토큰으로 갱신을 시도합니다...");

            const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();

                await SecureStore.setItemAsync('accessToken', data.accessToken);
                if (data.refreshToken) {
                    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
                }

                console.log("토큰 갱신 성공! 유저 모르게 생명 연장 완료.");
                return true;
            }
        }

        console.log("세션이 완전히 만료되었습니다. 로그아웃 처리합니다.");
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return false;

    } catch (error) {

        console.warn("네트워크 에러로 검증 불가:", error);
        return false;
    }
};