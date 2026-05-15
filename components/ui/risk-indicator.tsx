import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RiskLevel } from '@/api/cafeteria';
import { useTranslation } from '@/lib/i18n';

interface RiskIndicatorProps {
    level: RiskLevel | null;
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
    const t = useTranslation();
    if (level === 'danger') {
        // 가장 위험한 단계 — 깊은 빨강 + 경고 이모지
        return (
            <View className="rounded-full bg-red-700 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">⚠ {t('risk.danger')}</Text>
            </View>
        );
    }
    if (level === 'high') {
        return (
            <View className="rounded-full bg-red-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">{t('risk.high')}</Text>
            </View>
        );
    }
    if (level === 'medium') {
        return (
            <View className="rounded-full bg-yellow-400 px-2.5 py-1">
                <Text className="text-xs font-bold text-yellow-900">{t('risk.medium')}</Text>
            </View>
        );
    }
    if (level === 'low') {
        return (
            <View className="rounded-full bg-green-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">{t('risk.low')}</Text>
            </View>
        );
    }
    if (level === 'safe') {
        // 분석되어 안전 확인된 상태 → 초록 체크 아이콘
        return <Ionicons name="checkmark-circle" size={22} color="#16a34a" />;
    }
    // UNKNOWN 또는 정보 없음 → 회색 ? 아이콘
    return <Ionicons name="help-circle" size={20} color="#9CA3AF" />;
}
