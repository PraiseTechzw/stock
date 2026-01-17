import { useUserManagement } from '@/src/hooks/useUserManagement';
import { Delete02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Card, FAB, IconButton, Text, useTheme } from 'react-native-paper';

export default function UserManagementScreen() {
    const { users, deleteUser } = useUserManagement();
    const router = useRouter();
    const theme = useTheme();

    const handleDelete = (id: number, username: string) => {
        if (username === 'admin') {
            Alert.alert('Error', 'The system administrator cannot be deleted.');
            return;
        }

        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${username}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteUser(id)
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: any }) => (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title
                title={item.fullName || item.username}
                titleStyle={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                subtitle={`Role: ${item.role?.toUpperCase()}`}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                left={(props) => (
                    <Avatar.Text
                        {...props}
                        label={(item.fullName || item.username).substring(0, 2).toUpperCase()}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        color={theme.colors.primary}
                    />
                )}
                right={(props) => (
                    <IconButton
                        {...props}
                        icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color={theme.colors.onSurfaceVariant} />}
                        onPress={() => handleDelete(item.id, item.username)}
                    />
                )}
            />
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'User Management' }} />

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <HugeiconsIcon icon={UserIcon} size={64} color={theme.colors.outlineVariant} />
                        <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No users found</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                label="Add User"
                style={styles.fab}
                onPress={() => router.push('/settings/add-user' as any)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
        borderRadius: 16,
        elevation: 1,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 24,
        right: 0,
        bottom: 0,
        borderRadius: 16,
    },
});
