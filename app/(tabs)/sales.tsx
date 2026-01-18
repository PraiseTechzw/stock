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
import { Button, Card, Surface, Text, useTheme } from 'react-native-paper';

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
        { title: 'New Sale', icon: ShoppingBag01Icon, route: '/sales/create', color: theme.colors.primary },
        { title: 'Customers', icon: UserGroupIcon, route: '/customers', color: theme.colors.tertiary },
        { title: 'Quotations', icon: LicenseIcon, route: '/sales/quotations', color: theme.colors.secondary },
        { title: 'Returns', icon: ArrowTurnBackwardIcon, route: '/sales/returns', color: theme.colors.error },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.headerSection, { backgroundColor: theme.colors.primary }]}>
                <Text variant="headlineSmall" style={styles.headerTitle}>Sales Hub</Text>
                <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage your shop's transactions</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.7}
                        >
                            <Surface style={[styles.iconBox, { backgroundColor: item.color + '15' }]} elevation={0}>
                                <HugeiconsIcon icon={item.icon} size={24} color={item.color} />
                            </Surface>
                            <Text variant="labelLarge" style={[styles.menuLabel, { color: theme.colors.onSurface }]}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SectionHeader
                    title="Recent Sales Orders"
                    actionLabel={orders.length > 5 ? "View All" : undefined}
                />
                {orders.length === 0 ? (
                    <Card style={[styles.activityCard, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                        <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.surfaceVariant + '40' }]}>
                                <HugeiconsIcon icon={ShoppingBag01Icon} size={48} color={theme.colors.outlineVariant} />
                            </View>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 16 }}>No Orders Yet</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
                                Start your first sale to see it listed here.
                            </Text>
                            <Button mode="contained" onPress={() => router.push('/sales/create')} style={styles.createButton}>
                                Quick Sale
                            </Button>
                        </Card.Content>
                    </Card>
                ) : (
                    <View style={styles.ordersList}>
                        {orders.sort((a, b) => b.id - a.id).slice(0, 5).map((order) => {
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
                        })}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        padding: 24,
        paddingTop: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: '900',
    },
    content: {
        padding: 16,
        marginTop: -20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    menuCard: {
        width: '48%',
        marginBottom: 16,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuLabel: {
        fontWeight: '900',
        fontSize: 13,
    },
    activityCard: {
        elevation: 1,
        borderRadius: 24,
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ordersList: {
        gap: 4,
    },
    createButton: {
        borderRadius: 16,
        width: '100%',
        height: 50,
        justifyContent: 'center',
    },
});
