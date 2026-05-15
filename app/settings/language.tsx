import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { ScrollView } from 'react-native';
import ScreenHeader from '../../components/ui/screen-header';
import { useTranslation } from '@/lib/i18n';

export default function SettingsLanguageScreen() {
    const t = useTranslation();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title={t('settings.language')} />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <LanguageSettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
