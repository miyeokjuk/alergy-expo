import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import ScreenHeader from '../../components/ui/screen-header';
import SchoolSettings from '@/components/settings/SchoolSettings';
import { useTranslation } from '@/lib/i18n';

export default function SettingsSchoolScreen() {
    const t = useTranslation();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title={t('settings.school')} />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <SchoolSettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
