import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { useAppStore } from '../store/useAppStore';
import { verifyAndRestoreSession } from '@/api/auth';
import { setOnAuthExpired } from '@/api/client';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
    const isLoggedIn = useAppStore((state) => state.isLoggedIn);
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const resetProfile = useAppStore((state) => state.resetProfile);
    const hydrateFromServerSettings = useAppStore((state) => state.hydrateFromServerSettings);
    const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
    const hasHydrated = useAppStore((state) => state._hasHydrated);
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();

    const [isAppReady, setIsAppReady] = useState(false);

    // 인증 만료 시 강제 로그아웃 콜백 등록
    useEffect(() => {
        setOnAuthExpired(() => {
            void (async () => {
                try {
                    await SecureStore.deleteItemAsync('accessToken');
                    await SecureStore.deleteItemAsync('refreshToken');
                } finally {
                    resetProfile();
                    setLoggedIn(false);
                }
            })();
        });
        return () => setOnAuthExpired(null);
    }, [resetProfile, setLoggedIn]);

    useEffect(() => {
        // zustand persist 하이드레이션이 끝나야 hasCompletedOnboarding 등이 정확함
        if (!hasHydrated) return;

        async function prepare() {
            try {
                console.log('자동 로그인 검사 시작');
                const session = await verifyAndRestoreSession();

                setLoggedIn(session.isValid);

                if (session.isValid) {
                    console.log('자동 로그인 성공 (토큰 존재). 서버 검증은 후속 API 호출에서 lazy 처리');
                    // persisted hasCompletedOnboarding을 그대로 신뢰. hydrate가 서버에서 최신값을 덮어씀.
                    if (useAppStore.getState().hasCompletedOnboarding) {
                        try {
                            await hydrateFromServerSettings();
                            console.log('서버 설정 동기화 완료');
                        } catch (hydrateError) {
                            console.warn('서버 설정 동기화 실패:', hydrateError);
                        }
                    }
                } else {
                    console.log('자동 로그인 실패 (토큰 없음). 로그인 화면으로');
                    resetProfile();
                }
            } catch (error) {
                console.warn('자동 로그인 에러:', error);
                setLoggedIn(false);
                resetProfile();
            } finally {
                setIsAppReady(true);
            }
        }
        prepare();
    }, [hasHydrated, hydrateFromServerSettings, resetProfile, setLoggedIn]);

    useEffect(() => {
        // 네비게이션이 준비되지 않았거나, 토큰 검사가 아직 안 끝났다면 리턴
        if (!rootNavigationState?.key || !isAppReady || !hasHydrated) return;

        const inAuthGroup = segments[0] === 'onboarding';
        const inTabsGroup = segments[0] === '(tabs)' || segments[0] === 'main';
        const inSettingsGroup = segments[0] === 'settings';
        const inMealDetailGroup = segments[0] === 'meal-detail';
        if (!isLoggedIn && segments.length > 0) {
            router.replace('/');
        } else if (isLoggedIn && !hasCompletedOnboarding && !inAuthGroup) {
            router.replace('/onboarding/language');
        } else if (isLoggedIn && hasCompletedOnboarding && !inTabsGroup && !inSettingsGroup && !inMealDetailGroup) {
            router.replace('/main');
        }

        // 라우팅 결정이 끝났으니 스플래시 화면 치우기
        SplashScreen.hideAsync();
    }, [hasCompletedOnboarding, hasHydrated, isAppReady, isLoggedIn, rootNavigationState?.key, router, segments]);

    return (
        <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="meal-detail" options={{ animation: 'slide_from_right' }} />
            </Stack>
        </QueryClientProvider>
    );
}
