import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
    const { isLoggedIn, hasCompletedOnboarding, _hasHydrated } = useAppStore();
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();
    const [isLayoutMounted, setIsLayoutMounted] = useState(false);

    useEffect(() => {
        if (!rootNavigationState?.key || !_hasHydrated) return;
        if (!isLayoutMounted) {
            setIsLayoutMounted(true);
            return;
        }

        const inAuthGroup = segments[0] === 'onboarding';
        const inTabsGroup = segments[0] === '(tabs)' || segments[0] === 'main';

        if (!isLoggedIn && segments.length > 0) {
            router.replace('/');
        } else if (isLoggedIn && !hasCompletedOnboarding && !inAuthGroup) {
            router.replace('/onboarding/language');
        } else if (isLoggedIn && hasCompletedOnboarding && !inTabsGroup) {
            router.replace('/main');
        }
        SplashScreen.hideAsync();
    }, [isLoggedIn, hasCompletedOnboarding, rootNavigationState?.key, segments, _hasHydrated, isLayoutMounted]);

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