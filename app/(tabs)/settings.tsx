import { MainHeader } from '@/src/components/ui/MainHeader';
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
    Shield01Icon,
    Store01Icon,
    Sun01Icon,
    UserGroupIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Dialog, Divider, List, Button as PaperButton, TextInput as PaperTextInput, Portal, Switch, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <MainHeader title="Settings" />

            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <Avatar.Text
                        size={80}
                        label={user?.username?.substring(0, 2).toUpperCase() || 'U'}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        color={theme.colors.primary}
                    />
                    <Text variant="headlineSmall" style={styles.profileName}>{user?.fullName || user?.username}</Text>
                    <Text variant="bodyMedium" style={styles.profileRole}>{user?.role?.toUpperCase()}</Text>
                </View>

                <Divider style={styles.divider} />

                <SectionHeader title="Business Profile" />
                <List.Section>
                    <List.Item
                        title="Store Name"
                        description={storeName || 'Not Set'}
                        onPress={() => openEditDialog('name')}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Store01Icon} size={24} color={theme.colors.primary} />} />}
                        right={props => <List.Icon {...props} icon="pencil" />}
                    />
                    <List.Item
                        title="Business Address"
                        description={businessAddress || 'Not Set'}
                        onPress={() => openEditDialog('address')}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={InformationCircleIcon} size={24} color={theme.colors.primary} />} />}
                        right={props => <List.Icon {...props} icon="pencil" />}
                    />
                </List.Section>

                <SectionHeader title="Preferences" />
                <List.Section>
                    <List.Item
                        title="App Theme"
                        description={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={themeMode === 'dark' ? Moon01Icon : themeMode === 'light' ? Sun01Icon : ComputerIcon} size={24} color={theme.colors.primary} />} />}
                        onPress={() => {
                            const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
                            const next = modes[(modes.indexOf(themeMode) + 1) % 3];
                            setThemeMode(next);
                        }}
                    />
                    <List.Item
                        title="Notifications"
                        description="Push alerts for low stock & sales"
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Notification03Icon} size={24} color={theme.colors.primary} />} />}
                        right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
                    />
                </List.Section>

                <SectionHeader title="Security & Users" />
                <List.Section>
                    <List.Item
                        title="User Management"
                        description="Add or remove staff accounts"
                        onPress={() => router.push('/settings/users')}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={UserGroupIcon} size={24} color={theme.colors.primary} />} />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                    <List.Item
                        title="Security"
                        description="Change your login password"
                        onPress={() => router.push('/settings/change-password')}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Shield01Icon} size={24} color={theme.colors.primary} />} />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                    <List.Item
                        title="Logout"
                        description="Sign out of your account"
                        onPress={logout}
                        titleStyle={{ color: theme.colors.error }}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Logout01Icon} size={24} color={theme.colors.error} />} />}
                    />
                </List.Section>

                <SectionHeader title="Data Management" />
                <List.Section style={{ marginBottom: 40 }}>
                    <List.Item
                        title="Export Products"
                        description="Download inventory as CSV"
                        onPress={() => handleExport('products')}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Database01Icon} size={24} color={theme.colors.primary} />} />}
                    />
                    <List.Item
                        title="Export Sales"
                        description="Download transaction history"
                        onPress={() => handleExport('sales')}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={File01Icon} size={24} color={theme.colors.primary} />} />}
                    />
                    <List.Item
                        title="Factory Reset"
                        description="Wipe all data and restart"
                        onPress={() => {
                            Alert.alert(
                                'DANGER: Factory Reset',
                                'This will permanently delete all products, sales, customers and local users. This action CANNOT be undone.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Wipe Everything', style: 'destructive', onPress: factoryReset }
                                ]
                            );
                        }}
                        titleStyle={{ color: theme.colors.error }}
                        left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={Logout01Icon} size={24} color={theme.colors.error} />} />}
                    />
                </List.Section>
            </ScrollView>

            {exporting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text variant="bodyLarge" style={{ marginTop: 12, color: '#fff' }}>Exporting data...</Text>
                </View>
            )}

            <Portal>
                <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)} style={{ borderRadius: 28 }}>
                    <Dialog.Title>Edit {editType === 'name' ? 'Store Name' : 'Address'}</Dialog.Title>
                    <Dialog.Content>
                        <PaperTextInput
                            mode="outlined"
                            value={editValue}
                            onChangeText={setEditValue}
                            autoFocus
                            outlineStyle={{ borderRadius: 12 }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <PaperButton onPress={() => setEditDialogVisible(false)}>Cancel</PaperButton>
                        <PaperButton onPress={saveEdit}>Save Changes</PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    profileName: {
        fontWeight: '900',
        marginTop: 12,
    },
    profileRole: {
        color: '#64748b',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    divider: {
        marginHorizontal: 20,
        marginBottom: 8,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    }
});
