import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import CountrySettings from '../../components/settings/CountrySettings';
import ScreenHeader from '../../components/ui/screen-header';
import { useTranslation } from '@/lib/i18n';

export default function SettingsCountryScreen() {
    const t = useTranslation();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title={t('settings.country')} />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <CountrySettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
