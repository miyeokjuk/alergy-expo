import { requestJson } from '@/api/client';

// 내 정보 조회

export async function getAllergySetting() {
    return requestJson<{ allergyCodes: string[] }>('/api/v1/settings/allergies', { method: 'GET' });
}

export async function getSchoolSetting() {
    return requestJson<{ schoolId: number }>('/api/v1/settings/school', { method: 'GET' });
}

export async function getReligionSetting() {
    return requestJson<{ religiousCode: string | null }>('/api/v1/settings/religion', { method: 'GET' });
}

export async function getLanguageSetting() {
    return requestJson<{ languageCode: string }>('/api/v1/settings/language', { method: 'GET' });
}

export async function getCountrySetting() {
    return requestJson<{ countryCode: string }>('/api/v1/settings/country', { method: 'GET' });
}

// 내 정보 변경
export async function updateAllergySetting(allergyCodes: string[]) {
    return requestJson<{ allergyCodes: string[] }>('/api/v1/settings/allergies', {
        method: 'PUT',
        body: JSON.stringify({ allergyCodes }),
    });
}

export async function updateSchoolSetting(schoolId: number) {
    return requestJson<{ schoolId: number }>('/api/v1/settings/school', {
        method: 'PATCH',
        body: JSON.stringify({ schoolId }),
    });
}

export async function updateReligionSetting(religiousCode: string | null) {
    return requestJson<{ religiousCode: string | null }>('/api/v1/settings/religion', {
        method: 'PATCH',
        body: JSON.stringify({ religiousCode }),
    });
}

export async function updateLanguageSetting(languageCode: string) {
    return requestJson<{ languageCode: string }>('/api/v1/settings/language', {
        method: 'PATCH',
        body: JSON.stringify({ languageCode }),
    });
}

export async function updateCountrySetting(countryCode: string) {
    return requestJson<{ countryCode: string }>('/api/v1/settings/country', {
        method: 'PATCH',
        body: JSON.stringify({ countryCode }),
    });
}

export interface ServerReligionOption {
    code: string;
    name: string;
}

export interface ServerLanguageOption {
    code: string;
    name: string;
    englishName: string;
}

export interface ServerCountryOption {
    code: string;
    name: string;
}

export interface ServerAllergyOption {
    code: string;
    name: string;
}

export interface ServerSchoolOption {
    schoolId: number;
    name: string;
}

// 서버에서 데이터 조회
export async function getReligionOptions() {
    return requestJson<{ religions: ServerReligionOption[] }>(
        '/api/v1/settings/options/religions',
        { method: 'GET' }
    );
}

export async function getLanguageOptions() {
    return requestJson<{ languages: ServerLanguageOption[] }>(
        '/api/v1/settings/options/languages',
        { method: 'GET' }
    );
}

export async function getCountryOptions() {
    return requestJson<{ countries: ServerCountryOption[] }>(
        '/api/v1/settings/options/countries',
        { method: 'GET' }
    );
}

export async function getAllergyOptions() {
    return requestJson<{ allergies: ServerAllergyOption[] }>(
        '/api/v1/settings/options/allergies',
        { method: 'GET' }
    );
}

export async function getSchoolOptions() {
    return requestJson<{ schools: ServerSchoolOption[] }>(
        '/api/v1/settings/options/schools',
        { method: 'GET' }
    );
}


//유저 정보 가져오기
export async function loadCurrentUserSettings() {
    const [languageResult, countryResult, schoolResult, religionResult, allergyResult] = await Promise.allSettled([
        getLanguageSetting(),
        getCountrySetting(),
        getSchoolSetting(),
        getReligionSetting(),
        getAllergySetting(),
    ]);

    return {
        languageCode: languageResult.status === 'fulfilled' ? languageResult.value.data.languageCode : undefined,
        countryCode: countryResult.status === 'fulfilled' ? countryResult.value.data.countryCode : undefined,
        schoolId: schoolResult.status === 'fulfilled' ? schoolResult.value.data.schoolId : undefined,
        religiousCode:
            religionResult.status === 'fulfilled' ? religionResult.value.data.religiousCode ?? undefined : undefined,
        allergyCodes: allergyResult.status === 'fulfilled' ? allergyResult.value.data.allergyCodes : undefined,
    };
}
