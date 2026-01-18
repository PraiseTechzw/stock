import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
    themeMode: ThemeMode;
    notificationsEnabled: boolean;
    storeName: string;
    currency: string;
    businessAddress: string;
    setThemeMode: (mode: ThemeMode) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setStoreName: (name: string) => void;
    setCurrency: (currency: string) => void;
    setBusinessAddress: (address: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            themeMode: 'system',
            notificationsEnabled: true,
            storeName: 'Praise Street Store',
            currency: 'USD',
            businessAddress: 'Harare, Zimbabwe',
            setThemeMode: (themeMode) => set({ themeMode }),
            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
            setStoreName: (storeName) => set({ storeName }),
            setCurrency: (currency) => set({ currency }),
            setBusinessAddress: (businessAddress) => set({ businessAddress }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
