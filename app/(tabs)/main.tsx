import React, { useState, useMemo, useRef, useEffect } from 'react'; // 👈 useRef, useEffect 추가!
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native'; // 👈 Dimensions 추가!
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import {useAppStore} from "@/store/useAppStore";

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function HomeScreen() {
    const scrollViewRef = useRef<ScrollView>(null);
    const {isLoggedIn,setLoggedIn,hasCompletedOnboarding} = useAppStore();
    const today = new Date();
    const todayString:string = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [selectedDate, setSelectedDate] = useState(todayString);

    const weekDates = useMemo(() => {
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

    useEffect(() => {
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
    }, [todayString, weekDates]);
    console.log(hasCompletedOnboarding);
    return (
        <SafeAreaView className="flex-1 bg-white pt-5">
            <View className="px-5 items-center mb-6">
                <Text className="text-3xl font-bold text-gray-800 mb-3">오늘의 학식 메뉴 🍽️</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">현재 필터: </Text>
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

            {/* 식단표 영역 */}
            <View className="flex-1 px-5 justify-center items-center">
                <Text className="text-gray-400">선택된 날짜: {selectedDate}</Text>
            </View>

            <View className="px-5 pb-5">
                <TouchableOpacity
                    className="bg-gray-200 py-4 rounded-xl items-center active:opacity-70"
                    onPress={() => {
                        setLoggedIn(false);
                        console.log("isLoggedIn:",isLoggedIn);
                    }}
                >
                    <Text className="text-gray-700 text-lg font-bold">로그아웃</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}