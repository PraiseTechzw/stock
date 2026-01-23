import { useAuth } from '@/src/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { Notification03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Avatar, Badge, Text, useTheme } from 'react-native-paper';

interface MainHeaderProps {
    title?: string;
    subtitle?: string;
    showStoreName?: boolean;
    showGreeting?: boolean;
    style?: ViewStyle;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
    title,
    subtitle,
    showStoreName = false,
    showGreeting = false,
    style
}) => {
    const theme = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const { storeName } = useSettingsStore();

    const displayTitle = title || (showStoreName ? (storeName || 'Stock Hub') : 'Dashboard');
    const displaySubtitle = subtitle || (showGreeting ? `Hello, ${user?.fullName || user?.username}` : (user?.fullName || user?.username));

    return (
        <View style={[styles.headerContainer, style]}>
            <View style={styles.headerRow}>
                <View style={styles.titleGroup}>
                    <Text variant="headlineMedium" style={styles.title}>
                        {displayTitle}
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        {displaySubtitle}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => router.push('/notifications')}
                        style={styles.notifBtn}
                    >
                        <HugeiconsIcon icon={Notification03Icon} size={28} color={theme.colors.onSurface} />
                        {unreadCount > 0 && (
                            <Badge
                                style={styles.notifBadge}
                                size={16}
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => router.push('/(tabs)/settings')}
                    >
                        <Avatar.Text
                            size={40}
                            label={user?.username?.substring(0, 2).toUpperCase() || 'U'}
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    titleGroup: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontWeight: '900',
        letterSpacing: -0.5,
        color: '#000',
    },
    subtitle: {
        color: '#64748b',
        fontWeight: '600',
        marginTop: -2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notifBtn: {
        position: 'relative',
        padding: 4,
    },
    notifBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        fontWeight: 'bold',
        backgroundColor: '#ef4444',
    },
    avatarContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
});
