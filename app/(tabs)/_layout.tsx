import { useAuth } from '@/src/hooks/useAuth';
import {
  DashboardSquare01Icon,
  Invoice01Icon,
  PackageIcon,
  Settings01Icon,
  ShoppingCart01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();
  const hasReportsPermission = useAuth(state => state.hasPermission('view-reports'));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <HugeiconsIcon icon={DashboardSquare01Icon} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => <HugeiconsIcon icon={PackageIcon} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <HugeiconsIcon icon={ShoppingCart01Icon} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="financials"
        options={{
          title: 'Financials',
          tabBarIcon: ({ color, size }) => <HugeiconsIcon icon={Invoice01Icon} color={color} size={size} />,
          href: hasReportsPermission ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <HugeiconsIcon icon={Settings01Icon} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
