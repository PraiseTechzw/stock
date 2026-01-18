import { useNotifications } from '@/src/hooks/useNotifications';
import {
    Alert02Icon,
    Delete02Icon,
    InformationCircleIcon,
    PackageIcon,
    Wallet01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';

export default function NotificationsScreen() {
    const theme = useTheme();
    const { notifications, markAllAsRead, deleteNotification, clearAll, unreadCount } = useNotifications();

    useEffect(() => {
        // Mark all as read when opening the screen
        if (unreadCount > 0) {
            markAllAsRead();
        }
    }, [unreadCount]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock': return { icon: PackageIcon, color: '#f57c00' };
            case 'debt': return { icon: Wallet01Icon, color: theme.colors.error };
            case 'system': return { icon: Alert02Icon, color: theme.colors.primary };
            default: return { icon: InformationCircleIcon, color: theme.colors.outline };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{
                title: 'Notifications',
                headerRight: () => (
                    <Button onPress={clearAll} textColor={theme.colors.error}>Clear All</Button>
                )
            }} />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <HugeiconsIcon icon={InformationCircleIcon} size={64} color={theme.colors.outlineVariant} />
                        <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
                            No notifications yet
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const { icon, color } = getIcon(item.type || 'info');
                    return (
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={item.isRead ? 0 : 2}>
                            <Card.Title
                                title={item.title}
                                titleStyle={{ fontWeight: item.isRead ? 'normal' : 'bold' }}
                                subtitle={item.body}
                                subtitleNumberOfLines={2}
                                left={(props) => (
                                    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                                        <HugeiconsIcon icon={icon} size={24} color={color} />
                                    </View>
                                )}
                                right={(props) => (
                                    <IconButton
                                        icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color={theme.colors.outline} />}
                                        onPress={() => deleteNotification(item.id)}
                                    />
                                )}
                            />
                            <Card.Content>
                                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                                    {new Date(item.created_at || '').toLocaleDateString()} {new Date(item.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </Card.Content>
                        </Card>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
        borderRadius: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    }
});
