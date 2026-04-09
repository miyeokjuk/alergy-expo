import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import {ALLERGY_LIST} from '@/constants/allergyList';


export default function AllergyScreen() {
    const { allergies, setAllergies, completeOnboarding } = useAppStore();

    const toggleAllergy = (icon: string) => {
        if (allergies.includes(icon)) {
            setAllergies(allergies.filter((a) => a !== icon)); // 이미 있으면 뺌
        } else {
            setAllergies([...allergies, icon]); // 없으면 추가
        }
    };

    return (

        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-red-500 mb-2">Allergies</Text>
                <Text className="text-gray-600 text-lg mb-10">피해야 할 식재료를 모두 골라주세요.</Text>

                <View className="flex-row flex-wrap gap-3">
                    {ALLERGY_LIST.map((allergy) => {
                        const isSelected = allergies.includes(allergy.icon);
                        return (
                            <TouchableOpacity
                                key={allergy.icon}
                                className={`w-[30%]  aspect-square flex-row items-center justify-center p-2 rounded-2xl border-2 relative ${
                                    isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => toggleAllergy(allergy.icon)}
                            >
                                <Text className={`text-lg font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                                    {allergy.icon} {allergy.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View className="flex-row bg-white px-5 pt-10 gap-x-6 justify-center">
                <TouchableOpacity
                    className="w-44 bg-black py-4 rounded-3xl items-center mb-5"
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-xl font-bold">이전으로</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-44 bg-pink-300 py-4 rounded-3xl items-center mb-5"
                    onPress={() => {
                        completeOnboarding();
                    }}
                >
                    <Text className="text-white text-lg font-bold">온보딩 완료 </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}