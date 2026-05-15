import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { View } from 'react-native';
import { ActionButton } from '../../components/ui/action-button';
import { useTranslation } from '@/lib/i18n';

export default function LanguageScreen() {
    const t = useTranslation();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <LanguageSettings
                title={t('onboarding.welcome')}
                subtitle={t('onboarding.languageSubtitle')}
                persistToServer
            />
            <View className="flex-row bg-white px-5 pt-10 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    {t('common.back')}
                </ActionButton>
                <ActionButton className="mb-5" onPress={() => router.push('/onboarding/country' as any)}>
                    {t('common.next')}
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
