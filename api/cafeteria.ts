import { requestJson } from '@/api/client';
import type { RiskLevel } from '@/data/mockMenu';

export interface ServerCafeteria {
    cafeteriaId: number;
    name: string;
}

export interface CafeteriasResponse {
    schoolId: number;
    cafeterias: ServerCafeteria[];
}

export async function getCafeterias() {
    return requestJson<CafeteriasResponse>('/api/v1/mealcrawl/cafeterias', { method: 'GET' });
}

export interface ServerMenuRisk {
    riskLevel: string; // HIGH | MEDIUM | LOW | UNKNOWN
}

export interface ServerMenu {
    mealMenuId: number;
    menuName: string;
    cornerName: string;
    displayOrder: number;
    spicyLevel: number;
    aiAnalyzed: boolean;
    risk: ServerMenuRisk;
}

export interface ServerMealSchedule {
    mealDate: string;
    mealType: string; // BREAKFAST | LUNCH | DINNER
    menus: ServerMenu[];
}

export interface WeeklyMealsResponse {
    schoolId: number;
    cafeteriaId: number;
    weekStartDate: string;
    weekEndDate: string;
    mealSchedules: ServerMealSchedule[];
}

export async function getWeeklyMeals(cafeteriaId: number, weekStartDate: string) {
    const params = new URLSearchParams({
        cafeteriaId: String(cafeteriaId),
        weekStartDate,
    });
    return requestJson<WeeklyMealsResponse>(
        `/api/v1/mealcrawl/weekly-meals?${params.toString()}`,
        { method: 'GET' }
    );
}

// 서버의 riskLevel(대문자) → 로컬 RiskLevel(소문자). UNKNOWN/없음은 null.
export function mapServerRiskLevel(level?: string): RiskLevel | null {
    switch (level?.toUpperCase()) {
        case 'HIGH':
            return 'high';
        case 'MEDIUM':
            return 'medium';
        case 'LOW':
            return 'low';
        default:
            return null;
    }
}

export const MEAL_TYPE_LABEL: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
};

export const MEAL_TYPE_ORDER: Record<string, number> = {
    BREAKFAST: 1,
    LUNCH: 2,
    DINNER: 3,
};
