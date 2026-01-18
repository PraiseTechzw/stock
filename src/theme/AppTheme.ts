import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
    MD3DarkTheme,
    MD3LightTheme,
    adaptNavigationTheme,
} from 'react-native-paper';
import { Colors } from './colors';

const { LightTheme: AdaptLightTheme, DarkTheme: AdaptDarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

export const AppLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: Colors.primary,
        secondary: Colors.secondary,
        tertiary: Colors.accent,
        background: Colors.light.background,
        surface: Colors.light.surface,
        surfaceVariant: Colors.light.surfaceVariant,
        outline: Colors.light.border,
        error: Colors.error,
    },
};

export const AppDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: Colors.primaryLight,
        secondary: Colors.secondary,
        tertiary: Colors.accent,
        background: Colors.dark.background,
        surface: Colors.dark.surface,
        surfaceVariant: Colors.dark.surfaceVariant,
        outline: Colors.dark.border,
        error: Colors.error,
    },
};

export const NavLightTheme = {
    ...AdaptLightTheme,
    colors: {
        ...AdaptLightTheme.colors,
        primary: Colors.primary,
        background: Colors.light.background,
        card: Colors.light.card,
        text: Colors.light.text,
        border: Colors.light.border,
        notification: Colors.light.notification,
    },
};

export const NavDarkTheme = {
    ...AdaptDarkTheme,
    colors: {
        ...AdaptDarkTheme.colors,
        primary: Colors.primaryLight,
        background: Colors.dark.background,
        card: Colors.dark.card,
        text: Colors.dark.text,
        border: Colors.dark.border,
        notification: Colors.dark.notification,
    },
};
