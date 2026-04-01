import { Stack } from 'expo-router';

export default function tabsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="main" />
            <Stack.Screen name="settings" />
        </Stack>
    );
}