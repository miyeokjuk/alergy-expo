import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useAppStore} from "@/store/useAppStore";
import { ActionButton } from '@/components/ui/action-button';
import * as SecureStore from 'expo-secure-store';
import { logoutFromServer } from '@/api/auth';
const SETTINGS_MENU = [
    { id: 'country', title: 'Country Settings', icon: 'earth-outline', path: '/settings/country' },
    { id: 'school', title: 'School Settings', icon: 'school-outline', path: '/settings/school' },
    { id: 'allergy', title: 'Allergy Settings', icon: 'shield-checkmark-outline', path: '/settings/allergy' },
    { id: 'language', title: 'Language Settings', icon: 'language-outline', path: '/settings/language' },
];

export default function SettingsScreen() {
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const resetProfile = useAppStore((state) => state.resetProfile);

    const handleLogout = async () => {
        try {
            await logoutFromServer();
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
        } finally {
            resetProfile();
            setLoggedIn(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-6">
                <Text className="text-2xl font-bold text-gray-800 mb-8">Settings</Text>

                <ScrollView className="space-y-4">
                    {SETTINGS_MENU.map((menu) => (
                        <TouchableOpacity
                            key={menu.id}
                            className="flex-row items-center justify-between bg-gray-50 p-5 rounded-2xl active:bg-gray-100"
                            onPress={() => router.push(menu.path as any)}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name={menu.icon as any} size={22} color="#4B5563" />
                                <Text className="ml-4 text-lg font-medium text-gray-700">{menu.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View className="px-5 pb-5 items-center">
                <ActionButton onPress={handleLogout}>
                    Log Out
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
