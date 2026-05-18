import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* 첫 온보딩 단계: 뒤로갈 수 없도록 스와이프-back 차단. */}
            <Stack.Screen name="language" options={{ gestureEnabled: false }} />
            <Stack.Screen name="country" />
            <Stack.Screen name="school" />
            <Stack.Screen name="allergy" />
        </Stack>
    );
}
