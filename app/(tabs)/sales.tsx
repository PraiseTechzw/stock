import {
    ArrowTurnBackwardIcon,
    LicenseIcon,
    ShoppingBag01Icon,
    UserGroupIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MainHeader } from '@/src/components/ui/MainHeader';
import { SalesOrderItem } from '@/src/components/ui/SalesOrderItem';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useCustomers } from '@/src/hooks/useCustomers';
import { useSales } from '@/src/hooks/useSales';

export default function SalesScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { orders } = useSales();
    const { customers } = useCustomers();

    const menuItems = [
        { title: 'New Sale', label: 'Create Order', icon: ShoppingBag01Icon, route: '/sales/create', color: '#6366f1' },
        { title: 'Quotations', label: 'Draft Quotes', icon: LicenseIcon, route: '/sales/quotations', color: '#10b981' },
        { title: 'Customers', label: 'Directory', icon: UserGroupIcon, route: '/customers', color: '#f59e0b' },
        { title: 'Returns', label: 'Refunds', icon: ArrowTurnBackwardIcon, route: '/sales/returns', color: '#ef4444' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <MainHeader title="Sales Overview" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                <HugeiconsIcon icon={item.icon} size={24} color={item.color} />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text variant="labelLarge" style={styles.menuTitle}>{item.title}</Text>
                                <Text variant="bodySmall" style={styles.menuLabel}>{item.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <SectionHeader
                    title="Recent Sales Orders"
                    actionLabel={orders.length > 5 ? "View All" : undefined}
                    onAction={() => router.push('/sales/history')}
                />

                <View style={styles.ordersList}>
                    {orders.length === 0 ? (
                        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content style={styles.emptyContent}>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No recent orders</Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        orders.sort((a, b) => {
                            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                            return dateB - dateA;
                        }).slice(0, 5).map((order) => {
                            const customer = customers.find(c => c.id === order.customerId);
                            return (
                                <SalesOrderItem
                                    key={order.id}
                                    orderId={order.id}
                                    customerName={customer?.name || 'Walk-in Customer'}
                                    totalAmount={order.totalAmount || 0}
                                    paymentStatus={order.paymentStatus as any}
                                    date={order.created_at || undefined}
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
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
    scrollContent: {
        padding: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    menuCard: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontWeight: '900',
        fontSize: 14,
        color: '#1e293b',
    },
    menuLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '600',
    },
    ordersList: {
        gap: 8,
    },
    emptyCard: {
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        elevation: 0,
    },
    emptyContent: {
        alignItems: 'center',
        padding: 20,
    },
});
