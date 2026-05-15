import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useAppStore} from "@/store/useAppStore";
import { ActionButton } from '@/components/ui/action-button';
import * as SecureStore from 'expo-secure-store';
import { logoutFromServer } from '@/api/auth';
import { getWeeklyMeals } from '@/api/cafeteria';
import { useTranslation } from '@/lib/i18n';

export default function SettingsScreen() {
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const resetProfile = useAppStore((state) => state.resetProfile);
    const t = useTranslation();

    const SETTINGS_MENU = [
        { id: 'country', title: t('settings.country'), icon: 'earth-outline', path: '/settings/country' },
        { id: 'school', title: t('settings.school'), icon: 'school-outline', path: '/settings/school' },
        { id: 'allergy', title: t('settings.allergy'), icon: 'shield-checkmark-outline', path: '/settings/allergy' },
        { id: 'language', title: t('settings.language'), icon: 'language-outline', path: '/settings/language' },
    ];

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

    const handleLoadWeekly = async () => {
        try {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            console.log('[weekly-meals] 요청: cafeteriaId=1, weekStartDate=', dateStr);

            const response = await getWeeklyMeals(4, dateStr);
            console.log('[weekly-meals] response =', JSON.stringify(response, null, 2));
        } catch (error) {
            console.warn('[weekly-meals] 호출 실패:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-6">
                <Text className="text-2xl font-bold text-gray-800 mb-8">{t('settings.title')}</Text>

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
            <View className="px-5 pb-5 items-center gap-3">
                <ActionButton onPress={handleLoadWeekly}>
                    Weekly
                </ActionButton>
                <ActionButton onPress={handleLogout}>
                    {t('settings.logOut')}
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
