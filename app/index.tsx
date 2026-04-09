import React, { useEffect } from 'react';
import { Text, View, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; // 구글 로그인
import { useAppStore } from "@/store/useAppStore";
import './global.css';

export default function LoginScreen() {
    const { setLoggedIn } = useAppStore();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        });
    }, []);

    // 구글 로그인 버튼 함수
    const handleGoogleLogin = async () => {
        try {
            // 구글 플레이 서비스가 가능한지 확인
            await GoogleSignin.hasPlayServices();

            // 로그인 창 띄우기
            const userInfo = await GoogleSignin.signIn();

            console.log('구글 로그인 성공');
            const idToken = userInfo?.data?.idToken;

            // 토큰 확인 후 메인 화면으로 이동
            if (idToken) {
                console.log(' id 토큰:', idToken);
                setLoggedIn(true);
            }

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('유저가 로그인 창을 닫았습니다.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('이미 로그인이 진행 중입니다.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('오류', '구글 플레이 서비스가 불가능합니다.');
            } else {
                Alert.alert('로그인 실패', '구글 로그인 중 알 수 없는 오류가 발생했습니다.');
                console.error('로그인 에러:', error);
            }
        }
    };


    // 애플 로그인 로직
    // const handleAppleLogin = async () => {
    //     try {
    //         const credential = await AppleAuthentication.signInAsync({
    //             requestedScopes: [
    //                 AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    //                 AppleAuthentication.AppleAuthenticationScope.EMAIL,
    //             ],
    //         });
    //         if(credential.user) {
    //             console.log(' 애플 로그인 성공. 정보:', credential);
    //             setLoggedIn(true);
    //         }
    //     } catch (e: any) {
    //         if (e.code === 'ERR_REQUEST_CANCELED') {
    //             console.log('유저가 로그인 창을 닫았습니다.');
    //         } else {
    //             Alert.alert('로그인 실패', '애플 로그인 중 오류가 발생했습니다.');
    //         }
    //     }
    // };

    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-white px-8">
            <View className="items-center mb-16">
                <Text className="text-4xl font-bold text-gray-900 mb-2">Allergy Safe</Text>
                <Text className="text-gray-500 text-lg">유학생을 위한 맞춤형 식단표</Text>
            </View>

            <View className="w-3/5 gap-4">
                {/*/!* 애플 로그인 버튼 *!/*/}
                {/*<AppleAuthentication.AppleAuthenticationButton*/}
                {/*    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}*/}
                {/*    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}*/}
                {/*    cornerRadius={12}*/}
                {/*    style={{ width: '100%', height: 50 }}*/}
                {/*    onPress={handleAppleLogin}*/}
                {/*/>*/}

                {/* 구글 로그인 버튼 */}
                <TouchableOpacity
                    onPress={handleGoogleLogin}
                    className="w-full h-[50px] bg-white border border-gray-300 rounded-2xl flex-row justify-center items-center active:bg-gray-400"
                >
                    <Text className="text-gray-900 font-semibold text-base">
                        <Text className="text-gray-900 font-bold text-xl ">Google </Text>
                        계정으로 시작하기
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}