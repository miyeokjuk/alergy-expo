import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import AllergySettings from '../../components/settings/AllergySettings';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../components/ui/action-button';
import { saveOnboardingProfile } from '@/api/onboarding';
import { toAllergyCodes } from '@/constants/allergyList';
import { toServerReligiousCode } from '@/data/religiousOptions';
import { useState } from 'react';
import { useTranslation, t as tFn } from '@/lib/i18n';


export default function AllergyScreen() {
    const t = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const language = useAppStore((state) => state.language);
    const country = useAppStore((state) => state.country);
    const schoolId = useAppStore((state) => state.schoolId);
    const religiousCode = useAppStore((state) => state.religiousCode);
    const allergies = useAppStore((state) => state.allergies);
    const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);

    const handleFinishOnboarding = async () => {
        if (isSubmitting) return;

        if (schoolId === null) {
            Alert.alert(tFn('onboarding.schoolMissing'), tFn('onboarding.schoolMissingMessage'));
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await saveOnboardingProfile({
                languageCode: language,
                schoolId,
                allergyCodes: toAllergyCodes(allergies),
                religiousCode: toServerReligiousCode(religiousCode),
                countryCode: country,
            });

            if (!result.onboardingCompleted) {
                throw new Error('Onboarding was not completed on the server.');
            }

            setHasCompletedOnboarding(true);
            router.replace('/main');
        } catch (error: any) {
            Alert.alert(tFn('onboarding.failed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
            <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <AllergySettings persistToServer={false} />
            </View>
            <View className="flex-row bg-white px-5 pt-4 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    {t('common.back')}
                </ActionButton>
                <ActionButton className="mb-5" disabled={isSubmitting} onPress={handleFinishOnboarding}>
                    {isSubmitting ? t('onboarding.finishing') : t('onboarding.finish')}
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
