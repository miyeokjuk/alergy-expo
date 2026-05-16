import { useRef, useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation, t as tFn } from '@/lib/i18n';

export default function CameraScreen() {
    const t = useTranslation();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const [facing, setFacing] = useState<CameraType>('back');
    // 탭에서 벗어나면 카메라 unmount (배터리/프라이버시), 다시 들어오면 mount.
    const [isActive, setIsActive] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setIsActive(true);
            return () => setIsActive(false);
        }, [])
    );

    // ─── 권한 미결정 ───
    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">···</Text>
            </SafeAreaView>
        );
    }

    // ─── 권한 거부 상태 UI ───
    if (!permission.granted) {
        const handleGrant = async () => {
            const next = await requestPermission();
            if (!next.granted && !next.canAskAgain) {
                // 두 번 거부 → 설정 앱으로 유도
                Alert.alert(
                    tFn('camera.permission.title'),
                    tFn('camera.permission.message'),
                    [
                        { text: tFn('common.cancel'), style: 'cancel' },
                        {
                            text: tFn('camera.permission.openSettings'),
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
            }
        };

        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6">
                        <Ionicons name="camera-outline" size={40} color="#6B7280" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                        {t('camera.permission.title')}
                    </Text>
                    <Text className="text-base text-gray-600 text-center leading-6 mb-8">
                        {t('camera.permission.message')}
                    </Text>
                    <TouchableOpacity
                        onPress={handleGrant}
                        className="bg-orange-500 rounded-full px-8 py-3"
                    >
                        <Text className="text-white font-semibold text-base">
                            {t('camera.permission.grant')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ─── 정상 카메라 미리보기 ───
    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            // 일단 촬영만 — AI 서버 연동 전까지는 안내 알림만 표시.
            await cameraRef.current.takePictureAsync({
                quality: 0.7,
                skipProcessing: Platform.OS === 'android',
            });
            Alert.alert(t('camera.title'), t('camera.comingSoon'));
        } catch (error: any) {
            Alert.alert(
                t('camera.title'),
                error?.message ?? tFn('common.tryAgain')
            );
        }
    };

    const toggleFacing = () =>
        setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

    return (
        <View className="flex-1 bg-black">
            {isActive ? (
                <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing={facing}
                    // 추후 AI 연동 시 onBarcodeScanned 등 props 추가 예정.
                />
            ) : (
                <View className="flex-1 bg-black" />
            )}

            {/* 상단 안내 */}
            <SafeAreaView
                edges={['top']}
                className="absolute top-0 left-0 right-0"
                pointerEvents="none"
            >
                <View className="px-5 pt-2">
                    <Text className="text-white text-xl font-bold">
                        {t('camera.title')}
                    </Text>
                    <Text className="text-white/80 text-sm mt-1">
                        {t('camera.subtitle')}
                    </Text>
                </View>
            </SafeAreaView>

            {/* 하단 컨트롤 */}
            <SafeAreaView
                edges={['bottom']}
                className="absolute bottom-0 left-0 right-0"
            >
                <View className="flex-row items-center justify-between px-10 pb-6 pt-4">
                    {/* placeholder (좌측) — 추후 갤러리 버튼 자리 */}
                    <View className="w-12 h-12" />

                    {/* 촬영 버튼 */}
                    <TouchableOpacity
                        onPress={handleCapture}
                        activeOpacity={0.7}
                        accessibilityLabel={t('camera.capture')}
                        className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
                    >
                        <View className="w-16 h-16 rounded-full bg-white" />
                    </TouchableOpacity>

                    {/* 전후면 전환 */}
                    <TouchableOpacity
                        onPress={toggleFacing}
                        accessibilityLabel={t('camera.flipCamera')}
                        className="w-12 h-12 rounded-full bg-black/40 items-center justify-center"
                    >
                        <Ionicons name="camera-reverse-outline" size={26} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
