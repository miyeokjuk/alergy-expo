import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import SchoolSettings from '@/components/settings/SchoolSettings';
import { ActionButton } from '@/components/ui/action-button';
import { useTranslation } from '@/lib/i18n';

export default function SchoolScreen() {
    const schoolId = useAppStore((state) => state.schoolId);
    const t = useTranslation();

    return (
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <SchoolSettings
                    title={t('onboarding.schoolTitle')}
                    subtitle={t('onboarding.schoolSubtitle')}
                    persistToServer={false}
                />
            </ScrollView>

            <View className="flex-row bg-white px-5 pt-6 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    {t('common.back')}
                </ActionButton>
                <ActionButton
                    className="mb-5"
                    disabled={schoolId === null}
                    onPress={() => router.push('/onboarding/allergy' as any)}
                >
                    {t('common.next')}
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
