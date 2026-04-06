import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from "react";
import {useAppStore} from "@/store/useAppStore";
const SETTINGS_MENU = [
    { id: 'allergy', title: '알러지 설정', icon: 'shield-checkmark-outline', path: '/settings/allergy' },
    { id: 'school', title: '학교 설정', icon: 'school-outline', path: '/settings/school' },
    { id: 'language', title: '언어 설정', icon: 'language-outline', path: '/settings/language' },
];

export default function SettingsScreen() {
    const { setLoggedIn } = useAppStore();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-6">
                <Text className="text-2xl font-bold text-gray-800 mb-8">설정</Text>

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
            <View className="px-5 pb-5">
                <TouchableOpacity
                    className="bg-gray-200 py-4 rounded-xl items-center active:opacity-70"
                    onPress={() => {
                        setLoggedIn(false);
                    }}
                >
                    <Text className="text-gray-700 text-lg font-bold">로그아웃</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}