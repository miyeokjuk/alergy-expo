import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'; // 🌟 useCallback 추가
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router'; // 🌟 useFocusEffect 추가
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { useAppStore } from "@/store/useAppStore";

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function HomeScreen() {
    const scrollViewRef = useRef<ScrollView>(null);
    const { hasCompletedOnboarding, allergies } = useAppStore();
    const today = new Date();
    const todayString: string = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [selectedDate, setSelectedDate] = useState(todayString);

    const weekDates = useMemo(() => {
        // ... (기존 weekDates 로직 동일) ...
        const dates = [];
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + diffToMonday + i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateId = `${year}-${month}-${day}`;

            dates.push({
                id: dateId,
                dayName: DAY_NAMES[date.getDay()],
                displayDate: `${month}.${day}`,
            });
        }
        return dates;
    }, []);

    // 🌟 핵심: 화면이 포커스될 때마다 실행되는 특수 훅!
    useFocusEffect(
        useCallback(() => {
            // 1. 유저가 탭에 다시 들어오면 무조건 날짜를 '오늘'로 강제 초기화합니다.
            setSelectedDate(todayString);

            // 2. 스크롤 위치도 '오늘' 날짜가 가운데 오도록 스르륵 원상복구 시켜줍니다. (최고의 UX!)
            const todayIndex = weekDates.findIndex(item => item.id === todayString);
            if (todayIndex >= 3) {
                setTimeout(() => {
                    const screenWidth = Dimensions.get('window').width;
                    const itemWidth = 75;
                    const offset = (todayIndex * itemWidth) - (screenWidth / 2) + (itemWidth / 2) + 20;
                    scrollViewRef.current?.scrollTo({
                        x: offset,
                        animated: true,
                    });
                }, 100);
            }

            // 클린업 함수 (포커스를 잃고 다른 탭으로 떠날 때 실행됨 - 여기선 비워둬도 무방)
            return () => {};
        }, [todayString, weekDates])
        // 💡 주의: useFocusEffect 안에는 무조건 useCallback을 감싸서 써야 무한 루프에 빠지지 않습니다!
    );

    // (기존에 있던 useEffect 스크롤 로직은 useFocusEffect 안으로 이사 갔으므로 삭제하셔도 됩니다!)

    return (
        <SafeAreaView className="flex-1 bg-white pt-5">
            <View className="px-5 items-center mb-6">
                <Text className="text-3xl font-bold text-gray-800 mb-3">오늘의 학식 메뉴 🍽️</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">현재 필터: {allergies}</Text>
                </View>
            </View>

            <View className="mb-6">
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                >
                    {weekDates.map((item) => {
                        const isSelected = selectedDate === item.id;
                        const isToday = item.id === todayString;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedDate(item.id)}
                                className={`items-center justify-center py-3 px-5 rounded-2xl border-2 ${
                                    isSelected
                                        ? 'border-black bg-black'
                                        : 'border-gray-200 bg-white'
                                }`}
                            >
                                <Text className={`text-sm font-medium mb-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {item.dayName}
                                </Text>
                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {item.displayDate}
                                </Text>
                                {isToday && (
                                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View className="flex-1 px-5 justify-center items-center">
                <Text className="text-gray-400">선택된 날짜: {selectedDate}</Text>
            </View>
        </SafeAreaView>
    );
}