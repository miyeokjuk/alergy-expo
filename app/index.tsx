import {Text, View, Alert, TouchableOpacity} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication'; // 애플 로그인 기능 불러오기!
import './global.css';
export default function LoginScreen() {

    // 애플 로그인 버튼 핸들
    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            // 로그인이 성공 시 수행
            console.log('애플 로그인 성공. 정보:', credential);
            router.push('/onboarding/language');

        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                console.log('유저가 로그인 창을 닫았습니다.');
            } else {
                Alert.alert('로그인 실패', '애플 로그인 중 오류가 발생했습니다.');
                console.error(e);
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-red-50 px-20">
            <View className="items-center mb-16">
                <Text className="text-4xl font-bold text-black-500 mb-2">Allergy Safe</Text>
                <Text className="text-gray-600 text-lg">유학생을 위한 맞춤형 식단표</Text>
            </View>

            {/* 애플 로그인 버튼 (수정x) */}
            <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={{ width: '100%', height: 50 }}
                onPress={handleAppleLogin}
            />
            <TouchableOpacity
                className="w-44 bg-pink-300 py-4 rounded-3xl items-center mb-5"
                onPress={() => {
                    router.push('/main');}}
            >
                <Text className="text-white text-lg font-bold">바로 메인 </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}