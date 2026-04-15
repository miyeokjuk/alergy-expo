import * as SecureStore from 'expo-secure-store';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const loginWithGoogleToken = async (idToken: string) => {

    // ⭐️ 토큰을 헤더에 담음
    const response = await fetch(`${API_URL}/api/auth/google/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message ?? `서버 응답 오류: ${response.status}`;
        throw new Error(errorMessage);
    }

    // JWT 받기
    const data = await response.json();
    const { accessToken, refreshToken } = data;

    if (!accessToken) {
        throw new Error('서버에서 토큰을 받지 못했습니다.');
    }

    await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    }
    console.log('JWT 발급 완료');
    return data;
};

export const verifyAndRestoreSession = async (): Promise<boolean> => {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!accessToken) return false; // 토큰이 없으면 실패

        // 1. 내 정보(또는 토큰 검증) API를 찔러서 액세스 토큰이 살아있는지 확인합니다.
        // (백엔드에 '가장 가벼운 유저 정보 조회 API'가 무엇인지 물어보고 그 주소를 쓰세요)
        const response = await fetch(`${API_URL}/api/user/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            console.log("액세스 토큰이 아직 쌩쌩합니다!");
            return true;
        }

        // 2. 만약 액세스 토큰이 만료(401)되었다면? -> 리프레시 시도!
        if (response.status === 401 && refreshToken) {
            console.log("액세스 토큰 만료됨. 리프레시 토큰으로 갱신을 시도합니다...");

            const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }) // 바디로 보낼지 헤더로 보낼지 백엔드와 맞추기
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();

                // 새로 발급받은 토큰들을 금고에 다시 안전하게 보관!
                await SecureStore.setItemAsync('accessToken', data.accessToken);
                if (data.refreshToken) {
                    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
                }

                console.log("토큰 갱신 성공! 유저 모르게 생명 연장 완료.");
                return true;
            }
        }

        // 3. 리프레시 토큰마저 만료되었거나, 알 수 없는 에러가 발생했다면 깔끔하게 포기
        console.log("세션이 완전히 만료되었습니다. 로그아웃 처리합니다.");
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return false;

    } catch (error) {
        // 인터넷이 끊겼거나 서버가 죽은 경우 (이때는 강제 로그아웃 시키지 않는 것이 UX에 좋습니다)
        console.warn("네트워크 에러로 검증 불가:", error);
        return false;
    }
};