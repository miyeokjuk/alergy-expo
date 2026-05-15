import React, { useEffect } from 'react';
import { Text, View, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from "@/store/useAppStore";
import './global.css';
import {loginWithGoogleToken} from "@/api/auth";
import { useTranslation, t as tFn } from '@/lib/i18n';

export default function LoginScreen() {
    const t = useTranslation();
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);
    const resetProfile = useAppStore((state) => state.resetProfile);
    const hydrateFromServerSettings = useAppStore((state) => state.hydrateFromServerSettings);
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        });
    }, []);



    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo?.data?.idToken;

            // 구글 토큰 발급 후
            if (idToken) {
                const deviceId = await DeviceInfo.getUniqueId();
                console.log('deviceId acquired: ', deviceId);
                console.log('idToken: ', idToken);
                console.log('Google ID token acquired, sending to server');
                const authData = await loginWithGoogleToken(idToken, deviceId);
                setLoggedIn(true);
                setHasCompletedOnboarding(Boolean(authData.onboardingCompleted));

                // 기존 유저
                if (authData.onboardingCompleted) {
                    await hydrateFromServerSettings();
                }
                // 신규 유저
                else {
                    resetProfile();
                }
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('The user closed the sign-in window.');
            }
            else {
                Alert.alert(tFn('login.failedTitle'), error.message || tFn('login.failedMessage'));
                console.error('Sign-in error:', error);
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
                <Text className="text-4xl font-bold text-gray-900 mb-2">{t('login.brand')}</Text>
                <Text className="text-gray-500 text-lg">{t('login.tagline')}</Text>
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
                    <Text className="text-gray-900 font-semibold text-base">{t('login.continueWithGoogle')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>setLoggedIn(true)}
                    className="w-full h-[50px] bg-white border border-gray-300 rounded-2xl flex-row justify-center items-center active:bg-gray-400"
                >
                    <Text className="text-gray-900 font-semibold text-base">
                        {t('login.devEnter')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setLoggedIn(true);
                        setHasCompletedOnboarding(true);
                    }}
                    className="w-full h-[50px] bg-white border border-gray-300 rounded-2xl flex-row justify-center items-center active:bg-gray-400"
                >
                    <Text className="text-gray-900 font-semibold text-base">
                        {t('login.devSkipOnboarding')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
