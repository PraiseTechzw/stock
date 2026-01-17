import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { useExport } from '@/src/hooks/useExport';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import {
    ComputerIcon,
    Database01Icon,
    File01Icon,
    Logout01Icon,
    Moon01Icon,
    Notification03Icon,
    Shield01Icon,
    Sun01Icon,
    UserGroupIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Divider, List, Switch, Text, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const { exportProducts, exportSales } = useExport();
    const { themeMode, setThemeMode, notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
    const router = useRouter();
    const theme = useTheme();
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type: 'products' | 'sales') => {
        setExporting(true);
        const success = type === 'products' ? await exportProducts() : await exportSales();
        setExporting(false);

        if (success) {
            Alert.alert('Success', `${type === 'products' ? 'Inventory' : 'Sales'} data exported successfully.`);
        } else {
            Alert.alert('Error', 'Failed to export data.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.profileSection}>
                    <Avatar.Text
                        size={80}
                        label={user?.fullName?.substring(0, 2).toUpperCase() || 'U'}
                        style={{ backgroundColor: theme.colors.primary }}
                        color="#fff"
                    />
                    <Text variant="headlineSmall" style={[styles.profileName, { color: theme.colors.onSurface }]}>
                        {user?.fullName || user?.username}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.profileRole, { color: theme.colors.onSurfaceVariant }]}>
                        {user?.role?.toUpperCase()} Profile
                    </Text>
                </View>

                <Divider style={styles.divider} />

                <SectionHeader title="Theme Preferences" />
                <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="System"
                        description="Follow device theme settings"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={ComputerIcon} size={24} color={themeMode === 'system' ? theme.colors.primary : theme.colors.onSurfaceVariant} />} />}
                        right={(props) => themeMode === 'system' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                        onPress={() => setThemeMode('system')}
                    />
                    <List.Item
                        title="Light"
                        description="Always use light theme"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Sun01Icon} size={24} color={themeMode === 'light' ? theme.colors.primary : theme.colors.onSurfaceVariant} />} />}
                        right={(props) => themeMode === 'light' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                        onPress={() => setThemeMode('light')}
                    />
                    <List.Item
                        title="Dark"
                        description="Always use dark theme"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Moon01Icon} size={24} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.onSurfaceVariant} />} />}
                        right={(props) => themeMode === 'dark' ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                        onPress={() => setThemeMode('dark')}
                    />
                </List.Section>

                <SectionHeader title="Notification Settings" />
                <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Push Notifications"
                        description="Receive alerts for low stock and updates"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Notification03Icon} size={24} color={notificationsEnabled ? theme.colors.primary : theme.colors.onSurfaceVariant} />} />}
                        right={() => (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                color={theme.colors.primary}
                            />
                        )}
                    />
                </List.Section>

                <SectionHeader title="Account Security" />
                <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Change Password"
                        description="Update your account password"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Shield01Icon} size={24} color={theme.colors.primary} />} />}
                        right={(props) => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => router.push('/settings/change-password' as any)}
                    />
                    <List.Item
                        title="Logout"
                        description="Sign out from this device"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Logout01Icon} size={24} color={theme.colors.error} />} />}
                        onPress={logout}
                        titleStyle={{ color: theme.colors.error }}
                    />
                </List.Section>

                {user?.role === 'admin' && (
                    <>
                        <SectionHeader title="System Administration" />
                        <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                            <List.Item
                                title="User Management"
                                description="Manage staff members and roles"
                                left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={UserGroupIcon} size={24} color={theme.colors.primary} />} />}
                                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                                onPress={() => router.push('/settings/users' as any)}
                            />
                            <List.Item
                                title="Export Inventory"
                                description="Download products list as CSV"
                                left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Database01Icon} size={24} color={theme.colors.primary} />} />}
                                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                                onPress={() => handleExport('products')}
                            />
                            <List.Item
                                title="Export Sales"
                                description="Download sales history as CSV"
                                left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={File01Icon} size={24} color={theme.colors.primary} />} />}
                                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                                onPress={() => handleExport('sales')}
                            />
                        </List.Section>
                    </>
                )}

                <SectionHeader title="App Information" />
                <View style={styles.appInfo}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>STOCK v1.0.0</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Local-First Architecture</Text>
                </View>
            </ScrollView>

            {exporting && (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.backdrop + 'CC' }]}>
                    <ActivityIndicator size="large" />
                    <Text variant="bodyMedium" style={{ marginTop: 16, color: '#fff' }}>Generating CSV...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    profileName: {
        marginTop: 16,
        fontWeight: 'bold',
    },
    profileRole: {
        marginTop: 4,
    },
    divider: {
        marginVertical: 16,
    },
    listSection: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 1,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: 24,
        opacity: 0.6,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});
