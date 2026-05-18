import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { ActionButton } from '../../components/ui/action-button';
import { useTranslation, t as tFn } from '@/lib/i18n';
import { useSignOut } from '@/hooks/useSignOut';

export default function LanguageScreen() {
    const t = useTranslation();
    const signOut = useSignOut();

    // 사인아웃 — 실수 방지를 위해 확인 다이얼로그를 띄움.
    const handleSignOut = () => {
        Alert.alert(
            tFn('onboarding.signOutConfirm'),
            tFn('onboarding.signOutConfirmMessage'),
            [
                { text: tFn('common.cancel'), style: 'cancel' },
                {
                    text: tFn('common.signOut'),
                    style: 'destructive',
                    onPress: () => signOut(),
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <LanguageSettings
                title={t('onboarding.welcome')}
                subtitle={t('onboarding.languageSubtitle')}
                persistToServer
            />
            {/* 첫 온보딩 단계라 '뒤로'가 의미 없음 (가드가 다시 데려옴) → Next 한 개만, 가운데 정렬. */}
            <View className="bg-white px-5 pt-10 items-center">
                <ActionButton
                    className="mb-3"
                    onPress={() => router.push('/onboarding/country' as any)}
                >
                    {t('common.next')}
                </ActionButton>

                {/* 사인아웃 링크 — 다른 계정으로 로그인하고 싶을 때 사용 */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="self-center py-2"
                    accessibilityRole="button"
                    accessibilityLabel={t('common.signOut')}
                >
                    <Text className="text-gray-500 text-sm underline">
                        {t('onboarding.signOutHint')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
