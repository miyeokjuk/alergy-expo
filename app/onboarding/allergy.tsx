import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';

const ALLERGY_LIST = [
    { id: "peanut", icon: "🥜", name: "땅콩", nameEn: "Peanut" },
    { id: "treenut", icon: "🌰", name: "견과류", nameEn: "Tree Nuts" },
    { id: "soy", icon: "🫘", name: "대두/콩", nameEn: "Soy" },
    { id: "wheat", icon: "🌾", name: "밀", nameEn: "Wheat" },
    { id: "buckwheat", icon: "🍜", name: "메밀", nameEn: "Buckwheat" },
    { id: "sesame", icon: "🫚", name: "참깨", nameEn: "Sesame" },
    { id: "peach", icon: "🍑", name: "복숭아", nameEn: "Peach" },
    { id: "milk", icon: "🥛", name: "우유", nameEn: "Milk/Dairy" },
    { id: "egg", icon: "🥚", name: "계란", nameEn: "Egg" },
    { id: "fish", icon: "🐟", name: "생선", nameEn: "Fish" },
    { id: "shellfish", icon: "🦐", name: "갑각류", nameEn: "Shellfish" },
    { id: "mollusk", icon: "🦑", name: "연체류", nameEn: "Mollusks" },
    { id: "pork", icon: "🐷", name: "돼지고기", nameEn: "Pork" },
    { id: "beef", icon: "🐄", name: "쇠고기", nameEn: "Beef" },
    { id: "spicy", icon: "🌶️", name: "매운 음식", nameEn: "Spicy Food" },
];

export default function AllergyScreen() {
    const { allergies, setAllergies, completeOnboarding } = useAppStore();

    const toggleAllergy = (id: string) => {
        if (allergies.includes(id)) {
            setAllergies(allergies.filter((a) => a !== id)); // 이미 있으면 뺌
        } else {
            setAllergies([...allergies, id]); // 없으면 추가
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-red-500 mb-2">Allergies</Text>
                <Text className="text-gray-600 text-lg mb-10">피해야 할 식재료를 모두 골라주세요.</Text>

                <View className="flex-row flex-wrap gap-3">
                    {ALLERGY_LIST.map((allergy) => {
                        const isSelected = allergies.includes(allergy.id);
                        return (
                            <TouchableOpacity
                                key={allergy.id}
                                className={`w-[30%]  aspect-square flex-row items-center justify-center p-2 rounded-2xl border-2 relative ${
                                    isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => toggleAllergy(allergy.id)}
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
                        router.replace('/home');}}
                >
                    <Text className="text-white text-lg font-bold">온보딩 완료 </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}