import { Alert01Icon, Calendar02Icon, CheckmarkCircle01Icon, Clock01Icon, ShoppingBag01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Surface, Text, useTheme } from 'react-native-paper';

interface SalesOrderItemProps {
    orderId: number;
    customerName: string;
    totalAmount: number;
    paymentStatus?: 'paid' | 'partial' | 'credit';
    date?: string;
    onPress?: () => void;
}

export const SalesOrderItem: React.FC<SalesOrderItemProps> = ({
    orderId,
    customerName,
    totalAmount,
    paymentStatus = 'paid',
    date,
    onPress
}) => {
    const router = useRouter();
    const theme = useTheme();

    const getStatusConfig = () => {
        switch (paymentStatus) {
            case 'paid':
                return { label: 'Paid', color: '#10b981', bg: '#ecfdf5', icon: CheckmarkCircle01Icon };
            case 'credit':
                return { label: 'IOU', color: '#ef4444', bg: '#fef2f2', icon: Alert01Icon };
            case 'partial':
                return { label: 'Partial', color: '#f59e0b', bg: '#fffbeb', icon: Clock01Icon };
            default:
                return { label: 'Paid', color: '#10b981', bg: '#ecfdf5', icon: CheckmarkCircle01Icon };
        }
    };

    const status = getStatusConfig();
    const formattedDate = date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';

    return (
        <Surface elevation={1} style={styles.surface}>
            <Card
                style={styles.card}
                onPress={onPress || (() => router.push(`/sales/${orderId}` as any))}
            >
                <View style={styles.cardInner}>
                    <View style={styles.leftInfo}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer + '40' }]}>
                            <HugeiconsIcon icon={ShoppingBag01Icon} size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.textDetails}>
                            <View style={styles.titleRow}>
                                <Text style={styles.orderId}>Order #{orderId}</Text>
                                <Surface style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                                </Surface>
                            </View>
                            <View style={styles.metaRow}>
                                <HugeiconsIcon icon={UserIcon} size={12} color={theme.colors.outline} />
                                <Text style={styles.customerName} numberOfLines={1}>{customerName}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <HugeiconsIcon icon={Calendar02Icon} size={12} color={theme.colors.outline} />
                                <Text style={styles.dateText}>{formattedDate}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.rightPrice}>
                        <Text style={[styles.amount, { color: theme.colors.primary }]}>
                            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>
            </Card>
        </Surface>
    );
};

const styles = StyleSheet.create({
    surface: {
        marginBottom: 12,
        borderRadius: 16,
    },
    card: {
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    cardInner: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textDetails: {
        flex: 1,
        gap: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    orderId: {
        fontWeight: '900',
        fontSize: 15,
        color: '#1e293b',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    customerName: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 11,
        color: '#94a3b8',
    },
    rightPrice: {
        alignItems: 'flex-end',
    },
    amount: {
        fontWeight: '900',
        fontSize: 16,
    },
});
