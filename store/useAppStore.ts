import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
    isLoggedIn: boolean;
    language: string;
    school: string;
    allergies: string[];
    hasCompletedOnboarding: boolean;
    _hasHydrated: boolean;

    setLoggedIn: (status: boolean) => void;
    setLanguage: (lang: string) => void;
    setSchool: (school: string) => void;
    setAllergies: (allergies: string[]) => void;
    completeOnboarding: () => void;
    setHasHydrated: (status: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            language: 'en',
            school: '',
            allergies: [],
            hasCompletedOnboarding: false,
            _hasHydrated: false,
            setLoggedIn: (status) => set({ isLoggedIn: status }),
            setLanguage: (lang) => set({ language: lang }),
            setSchool: (school) => set({ school }),
            setAllergies: (allergies) => set({ allergies }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            setHasHydrated: (status) => set({ _hasHydrated: status }),
        }),
        {
            name: 'allergy-app-storage', // 기기에 저장될 파일명
            storage: createJSONStorage(() => AsyncStorage), // AsyncStorage를 통해 영구 저장
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);