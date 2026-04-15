import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
    const isLoggedIn = useAppStore((state) => state.isLoggedIn);
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
    const hasHydrated = useAppStore((state) => state._hasHydrated);
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();

    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {

        // 함수 선언
        async function prepare() {
            try {
                console.log("자동 로그인 검사 시작");
                const token = await SecureStore.getItemAsync('accessToken');

                if (token) {
                    // 기기에 토큰이 있다면 로그인 상태로 엎어침
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            } catch (error) {
                console.warn("자동 로그인 에러:", error);
            } finally {
                setIsAppReady(true);
            }
        }
        // 함수 호출
        prepare();
    }, [setLoggedIn]);

    // 라우팅: 상태에 따른 화면 이동
    useEffect(() => {
        // 네비게이션이 준비되지 않았거나, 토큰 검사가 아직 안 끝났다면 리턴
        if (!rootNavigationState?.key || !isAppReady || !hasHydrated) return;

        const inAuthGroup = segments[0] === 'onboarding';
        const inTabsGroup = segments[0] === '(tabs)' || segments[0] === 'main';
        const inSettingsGroup = segments[0] === 'settings';
        if (!isLoggedIn && segments.length > 0) {
            router.replace('/');
        } else if (isLoggedIn && !hasCompletedOnboarding && !inAuthGroup) {
            router.replace('/onboarding/language');
        } else if (isLoggedIn && hasCompletedOnboarding && !inTabsGroup && !inSettingsGroup) {
            router.replace('/main');
        }

        // 라우팅 결정이 끝났으니 스플래시 화면 치우기
        SplashScreen.hideAsync();

    }, [isLoggedIn, hasCompletedOnboarding, rootNavigationState?.key, isAppReady, hasHydrated, router, setLoggedIn, segments]);

    return (
        <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </QueryClientProvider>
    );
}
