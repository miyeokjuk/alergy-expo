import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' },
];

export default function LanguageScreen() {
    const { language, setLanguage } = useAppStore();

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome!</Text>
                <Text className="text-gray-500 text-lg mb-10">사용하실 언어를 선택해 주세요.</Text>

                <View className="gap-y-10">
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            // 선택된 언어면 까만 테두리, 아니면 회색 테두리
                            className={`py-5 px-5 rounded-3xl border-2 ${
                                language === lang.code ? 'border-black bg-pink-100' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => setLanguage(lang.code)}
                        >
                            <Text className={`text-xl font-semibold ${language === lang.code ? 'text-black' : 'text-gray-400'}`}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 학교 선택으로 넘어가는 스택 push */}
            <View className="flex-row bg-white px-5 pt-10 gap-x-6 justify-center">
                <TouchableOpacity
                    className="w-44 bg-black py-4 rounded-3xl items-center mb-5"
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-xl font-bold">이전으로</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-44 bg-black py-4 rounded-3xl items-center mb-5"
                    onPress={() => router.push('/onboarding/allergy' as any)}
                >
                    <Text className="text-white text-xl font-bold">다음으로</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}