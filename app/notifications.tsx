import { useNotifications } from '@/src/hooks/useNotifications';
import {
    Alert02Icon,
    ArrowLeft02Icon,
    Delete02Icon,
    InformationCircleIcon,
    Notification03Icon,
    PackageIcon,
    Wallet01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { notifications, markAllAsRead, deleteNotification, clearAll, unreadCount } = useNotifications();

    useEffect(() => {
        if (unreadCount > 0) {
            markAllAsRead();
        }
    }, [unreadCount]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock': return { icon: PackageIcon, color: '#f59e0b' };
            case 'debt': return { icon: Wallet01Icon, color: '#ef4444' };
            case 'system': return { icon: Alert02Icon, color: '#6366f1' };
            default: return { icon: InformationCircleIcon, color: theme.colors.outline };
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Inbox</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Activity & Alerts</Text>
                        </View>
                    </TouchableOpacity>
                    <Button
                        onPress={clearAll}
                        textColor={theme.colors.error}
                        labelStyle={{ fontWeight: '900' }}
                    >
                        Clear All
                    </Button>
                </View>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Surface style={styles.emptyIconBg} elevation={0}>
                            <HugeiconsIcon icon={Notification03Icon} size={64} color={theme.colors.outlineVariant} />
                        </Surface>
                        <Text variant="headlineSmall" style={{ marginTop: 24, fontWeight: '900', color: theme.colors.onSurface }}>
                            All caught up!
                        </Text>
                        <Text variant="bodyLarge" style={{ marginTop: 8, color: theme.colors.outline, textAlign: 'center', paddingHorizontal: 40 }}>
                            You don't have any notifications at the moment.
                        </Text>
                    </View>
                }
                renderItem={({ item, index }) => {
                    const { icon, color } = getIcon(item.type || 'info');
                    return (
                        <Animated.View entering={FadeInDown.delay(index * 50)}>
                            <Card
                                style={[
                                    styles.card,
                                    { backgroundColor: theme.colors.surface },
                                    !item.isRead && { borderLeftWidth: 4, borderLeftColor: color }
                                ]}
                                elevation={item.isRead ? 0 : 2}
                            >
                                <Card.Title
                                    title={item.title}
                                    titleStyle={{ fontWeight: item.isRead ? '700' : '900', fontSize: 16 }}
                                    subtitle={item.body}
                                    subtitleStyle={{ color: theme.colors.outline, fontSize: 14 }}
                                    subtitleNumberOfLines={3}
                                    left={(props) => (
                                        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                                            <HugeiconsIcon icon={icon} size={20} color={color} />
                                        </View>
                                    )}
                                    right={(props) => (
                                        <IconButton
                                            icon={() => <HugeiconsIcon icon={Delete02Icon} size={18} color={theme.colors.outlineVariant} />}
                                            onPress={() => deleteNotification(item.id)}
                                        />
                                    )}
                                />
                                <Card.Content style={styles.cardFooter}>
                                    <View style={styles.timeTag}>
                                        <Text variant="labelSmall" style={{ color: theme.colors.outline, fontWeight: '700' }}>
                                            {new Date(item.created_at || '').toLocaleDateString()} • {new Date(item.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        </Animated.View>
                    );
                }}
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
        justifyContent: 'space-between',
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
    list: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardFooter: {
        paddingTop: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingBottom: 12,
    },
    timeTag: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 120,
    },
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    }
});
