import { requestJson } from '@/api/client';

export interface OnboardingPayload {
    languageCode: string;
    schoolId: number;
    allergyCodes: string[];
    religiousCode: string | null;
    countryCode: string;
}

type OnboardingResponseData = OnboardingPayload & {
    onboardingCompleted: boolean;
};

export const saveOnboardingProfile = async (payload: OnboardingPayload) => {
    const result = await requestJson<OnboardingResponseData>('/api/v1/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return result.data;
};
