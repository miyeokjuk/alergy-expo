import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import CountrySettings from '../../components/settings/CountrySettings';
import { ActionButton } from '../../components/ui/action-button';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/i18n';

export default function CountryScreen() {
    const country = useAppStore((state) => state.country);
    const t = useTranslation();

    return (
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <CountrySettings
                    title={t('onboarding.countryTitle')}
                    subtitle={t('onboarding.countrySubtitle')}
                    persistToServer={false}
                />
            </ScrollView>
            <View className="flex-row bg-white px-5 pt-6 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    {t('common.back')}
                </ActionButton>
                <ActionButton className="mb-5" disabled={!country} onPress={() => router.push('/onboarding/school' as any)}>
                    {t('common.next')}
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
