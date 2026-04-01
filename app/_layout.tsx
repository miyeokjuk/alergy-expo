import { useEffect } from 'react';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';

const queryClient = new QueryClient();

export default function RootLayout() {
    // const { isLoggedIn, hasCompletedOnboarding } = useAppStore();
    // const rootNavigationState = useRootNavigationState();



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