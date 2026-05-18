import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAppStore } from '@/store/useAppStore';
import { logoutFromServer } from '@/api/auth';

/**
 * 사인아웃 공통 훅.
 *
 * 수행 절차
 *  1. 서버에 logout 통지 (refresh token 무효화) — 실패해도 무시
 *  2. SecureStore에서 토큰 제거
 *  3. zustand 프로필 초기화 (resetProfile)
 *  4. isLoggedIn = false → 라우팅 가드가 로그인 화면으로 이동
 *
 *  사용법
 *   const signOut = useSignOut();
 *   <Button onPress={signOut} />
 */
export function useSignOut() {
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const resetProfile = useAppStore((state) => state.resetProfile);

    return useCallback(async () => {
        try {
            await logoutFromServer();
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
        } finally {
            // 서버 통지 실패해도 클라이언트 상태는 무조건 정리
            resetProfile();
            setLoggedIn(false);
        }
    }, [resetProfile, setLoggedIn]);
}
