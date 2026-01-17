import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
    themeMode: ThemeMode;
    notificationsEnabled: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            themeMode: 'system',
            notificationsEnabled: true,
            setThemeMode: (themeMode) => set({ themeMode }),
            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
