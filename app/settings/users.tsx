import { useUserManagement } from '@/src/hooks/useUserManagement';
import { ArrowLeft02Icon, Delete02Icon, PlusSignIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, FAB, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserManagementScreen() {
    const { users, deleteUser } = useUserManagement();
    const router = useRouter();
    const theme = useTheme();

    const handleDelete = (id: number, username: string) => {
        if (username === 'admin') {
            Alert.alert('Restricted Action', 'The system administrator account is protected and cannot be deleted.');
            return;
        }

        Alert.alert(
            'Confirm Deletion',
            `Are you sure you want to remove ${username}? They will lose all access to the system immediately.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove User',
                    style: 'destructive',
                    onPress: () => deleteUser(id)
                },
            ]
        );
    };

    const renderUser = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50)}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={0}>
                <Card.Title
                    title={item.fullName || item.username}
                    titleStyle={{ fontWeight: '900', color: '#1e293b', fontSize: 16 }}
                    subtitle={`Role: ${item.role?.toUpperCase()}`}
                    subtitleStyle={{ color: '#64748b', fontWeight: '600' }}
                    left={(props) => (
                        <Avatar.Text
                            size={44}
                            label={(item.fullName || item.username).substring(0, 2).toUpperCase()}
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.primary}
                        />
                    )}
                    right={(props) => (
                        <IconButton
                            icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color="#94a3b8" />}
                            onPress={() => handleDelete(item.id, item.username)}
                        />
                    )}
                />
            </Card>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Staff List</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Manage user accounts</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Surface style={styles.emptyIconBg} elevation={0}>
                            <HugeiconsIcon icon={UserIcon} size={64} color={theme.colors.outlineVariant} />
                        </Surface>
                        <Text variant="headlineSmall" style={{ marginTop: 24, fontWeight: '900', color: theme.colors.onSurface }}>No staff added</Text>
                        <Text variant="bodyLarge" style={{ marginTop: 8, color: theme.colors.outline, textAlign: 'center' }}>
                            Start adding team members to manage your store.
                        </Text>
                    </View>
                }
            />

            <FAB
                animated
                icon={() => <HugeiconsIcon icon={PlusSignIcon} size={24} color="#fff" />}
                label="Add New User"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#fff"
                onPress={() => router.push('/settings/add-user' as any)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    headerTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        fontWeight: '900',
        letterSpacing: -0.5,
        color: '#000',
    },
    userName: {
        color: '#64748b',
        fontWeight: '600',
        marginTop: -2,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    empty: {
        marginTop: 120,
        alignItems: 'center',
    },
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    fab: {
        position: 'absolute',
        margin: 24,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
});
