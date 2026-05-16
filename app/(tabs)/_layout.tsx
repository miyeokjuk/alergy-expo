import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/lib/i18n';

export default function TabsLayout() {
    const t = useTranslation();
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        >
            <Tabs.Screen
                name="main"
                options={{
                    title: t('tab.menu'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="fast-food-outline" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="translate"
                options={{
                    title: t('tab.translate'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="camera"
                options={{
                    title: t('tab.camera'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="camera-outline" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: t('tab.settings'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="settings-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
