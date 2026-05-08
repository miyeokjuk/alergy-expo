import { Text } from 'react-native';

interface SpicyLevelProps {
    level: number;
    className?: string;
}

// 매운맛 단계별 고추 아이콘 개수 = level 그대로 (1→1개, 2→2개, 3→3개)
// level 0 또는 음수면 아무것도 표시하지 않음
export function SpicyLevel({ level, className }: SpicyLevelProps) {
    if (level <= 0) return null;
    return <Text className={className ?? 'text-base'}>{'🌶️'.repeat(level)}</Text>;
}
