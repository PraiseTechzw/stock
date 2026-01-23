import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { useExport } from '@/src/hooks/useExport';
import { useSystem } from '@/src/hooks/useSystem';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import {
    ComputerIcon,
    Database01Icon,
    File01Icon,
    InformationCircleIcon,
    Logout01Icon,
    Moon01Icon,
    Notification03Icon,
    Share01Icon,
    Shield01Icon,
    Store01Icon,
    Sun01Icon,
    UserGroupIcon,
    UserIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Dialog, Divider, List, Button as PaperButton, TextInput as PaperTextInput, Portal, Switch, Text, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const { exportProducts, exportSales } = useExport();
    const { themeMode, setThemeMode, notificationsEnabled, setNotificationsEnabled, storeName, setStoreName, businessAddress, setBusinessAddress } = useSettingsStore();
    const { factoryReset } = useSystem();
    const router = useRouter();
    const theme = useTheme();
    const [exporting, setExporting] = useState(false);
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editType, setEditType] = useState<'name' | 'address' | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleExport = async (type: 'products' | 'sales') => {
        setExporting(true);
        try {
            const success = type === 'products' ? await exportProducts() : await exportSales();
            if (success) {
                Alert.alert('Success', `${type === 'products' ? 'Inventory' : 'Sales'} data exported successfully.`);
            } else {
                Alert.alert('Error', 'Failed to export data.');
            }
        } catch (e) {
            Alert.alert('Error', 'An unexpected error occurred during export.');
        } finally {
            setExporting(false);
        }
    };

    const openEditDialog = (type: 'name' | 'address') => {
        setEditType(type);
        setEditValue(type === 'name' ? storeName : businessAddress);
        setEditDialogVisible(true);
    };

    const saveEdit = () => {
        if (editType === 'name') setStoreName(editValue);
        else if (editType === 'address') setBusinessAddress(editValue);
        setEditDialogVisible(false);
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

                <SectionHeader title="Business Identity" />
                <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Store Name"
                        description={storeName}
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Store01Icon} size={24} color={theme.colors.primary} />} />}
                        onPress={() => openEditDialog('name')}
                    />
                    <List.Item
                        title="Business Address"
                        description={businessAddress}
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={InformationCircleIcon} size={24} color={theme.colors.primary} />} />}
                        onPress={() => openEditDialog('address')}
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
                <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                    <List.Item
                        title="Developer & Creator"
                        description="Praise Masunga (@PraiseTechzw)"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={UserIcon} size={24} color={theme.colors.primary} />} />}
                        onPress={() => Alert.alert(
                            'About Developer',
                            'Praise Masunga is a high-end Software Engineer specializing in React Native, Flutter, and AI solutions. \n\nFocus: Innovative, local-first inventory systems for SMEs.'
                        )}
                    />
                    <List.Item
                        title="Github Portfolio"
                        description="github.com/PraiseTechzw"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Share01Icon} size={24} color={theme.colors.primary} />} />}
                        onPress={() => Alert.alert('Portfolio', 'Visit github.com/PraiseTechzw for more innovative projects.')}
                    />
                    <List.Item
                        title="Build Version"
                        description="1.0.0-Stable (Production Ready)"
                        left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={ComputerIcon} size={24} color={theme.colors.onSurfaceVariant} />} />}
                    />
                </List.Section>

                {user?.role === 'admin' && (
                    <>
                        <SectionHeader title="Danger Zone" />
                        <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surface }]}>
                            <List.Item
                                title="Reset All Data"
                                description="Permanently delete all stock and sales records"
                                left={(props) => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Database01Icon} size={24} color={theme.colors.error} />} />}
                                onPress={() => Alert.alert(
                                    'DANGER: Factory Reset',
                                    'This will wipe ALL sales, customers, and inventory data. This cannot be undone.',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'RESET EVERYTHING', style: 'destructive', onPress: factoryReset }
                                    ]
                                )}
                                titleStyle={{ color: theme.colors.error }}
                            />
                        </List.Section>
                    </>
                )}

                <View style={styles.appInfo}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Local-First Architecture | Highly Secure</Text>
                    <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.primary, fontWeight: 'bold' }}>Designed & Developed by Praise Masunga</Text>
                </View>
            </ScrollView>

            {exporting && (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.backdrop + 'CC' }]}>
                    <ActivityIndicator size="large" />
                    <Text variant="bodyMedium" style={{ marginTop: 16, color: '#fff' }}>Generating CSV...</Text>
                </View>
            )}

            <Portal>
                <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)} style={{ borderRadius: 24 }}>
                    <Dialog.Title>Edit {editType === 'name' ? 'Store Name' : 'Business Address'}</Dialog.Title>
                    <Dialog.Content>
                        <PaperTextInput
                            mode="outlined"
                            value={editValue}
                            onChangeText={setEditValue}
                            placeholder={editType === 'name' ? "Enter store name" : "Enter business address"}
                            autoFocus
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <PaperButton onPress={() => setEditDialogVisible(false)}>Cancel</PaperButton>
                        <PaperButton onPress={saveEdit} mode="contained" style={{ borderRadius: 12 }}>Save</PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
