import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';

const SCHOOLS = ['금오공과대학교', '서울대학교', '부산대학교', '경북대학교'];

export default function SchoolScreen() {
    const { school, setSchool } = useAppStore();

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">University</Text>
                <Text className="text-gray-500 text-lg mb-10">다니고 계신 대학교를 선택해 주세요.</Text>

                <View className="flex-row flex-wrap gap-3">
                    {SCHOOLS.map((s) => (
                        <TouchableOpacity
                            key={s}
                            className={`py-3 px-5 rounded-full border-2 ${
                                school === s ? 'border-black bg-black' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => setSchool(s)}
                        >
                            <Text className={`text-base font-semibold ${school === s ? 'text-white' : 'text-gray-600'}`}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="flex-row gap-x-3 mb-5">
                {/* 뒤로 가기 버튼 (스택의 맨 위 종이 버리기) */}
                <TouchableOpacity
                    className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
                    onPress={() => router.back()}
                >
                    <Text className="text-gray-700 text-lg font-bold">뒤로</Text>
                </TouchableOpacity>

                {/* 학교가 선택되어야만 넘어갈 수 있게 막아둡니다 */}
                <TouchableOpacity
                    className={`flex-[2] py-4 rounded-xl items-center ${school ? 'bg-black' : 'bg-gray-300'}`}
                    disabled={!school}
                    onPress={() => router.push('/onboarding/allergy' as any)}
                >
                    <Text className="text-white text-lg font-bold">다음으로</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}