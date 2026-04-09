import { router } from 'expo-router';
import AllergySelector from '../../components/settings/AllergySetting';

export default function SettingsAllergy() {
    return (
        <AllergySelector
            buttonText="완료"
            onPress={() => {
                router.back();
            }}
        />
    );
}