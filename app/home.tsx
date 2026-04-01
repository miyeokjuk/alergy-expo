import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import './global.css';
export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white px-5 justify-center">
            <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-gray-800 mb-3">오늘의 학식 메뉴 🍽️</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">현재 필터: </Text>
                </View>
            </View>

            {/* 뒤로 가기 버튼*/}
            <TouchableOpacity
                className="bg-gray-200 py-4 rounded-xl items-center active:opacity-70"
                onPress={() => router.back()}
            >
                <Text className="text-gray-700 text-lg font-bold">뒤로 가기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}