import AllergySettings from '../../components/settings/AllergySettings';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ui/screen-header';
import { useTranslation } from '@/lib/i18n';

export default function SettingsAllergy() {
    const t = useTranslation();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title={t('settings.allergy')} />

            <View className="flex-1">
                <AllergySettings showHeader={false} />
            </View>
        </SafeAreaView>
    );
}
