import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RiskLevel } from '@/api/cafeteria';

interface RiskIndicatorProps {
    level: RiskLevel | null;
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
    if (level === 'high') {
        return (
            <View className="rounded-full bg-red-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">High</Text>
            </View>
        );
    }
    if (level === 'medium') {
        return (
            <View className="rounded-full bg-yellow-400 px-2.5 py-1">
                <Text className="text-xs font-bold text-yellow-900">Medium</Text>
            </View>
        );
    }
    if (level === 'low') {
        return (
            <View className="rounded-full bg-green-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">Low</Text>
            </View>
        );
    }
    // UNKNOWN 또는 정보 없음 → 회색 ? 아이콘
    // (HIGH/MEDIUM/LOW는 서버가 명시적으로 전달. 그 외엔 "분석되지 않음" 상태)
    return <Ionicons name="help-circle" size={20} color="#9CA3AF" />;
}
