import {
    ArrowTurnBackwardIcon,
    LicenseIcon,
    ShoppingBag01Icon,
    UserGroupIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

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
            <View style={styles.content}>
                <SectionHeader title="Sales Operations" />
                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <Card
                            key={index}
                            style={[styles.menuCard, { backgroundColor: theme.colors.surface }]}
                            onPress={() => router.push(item.route as any)}
                        >
                            <Card.Content style={styles.cardContent}>
                                <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                    <HugeiconsIcon icon={item.icon} size={24} color={item.color} />
                                </View>
                                <Text variant="labelLarge" style={[styles.menuLabel, { color: theme.colors.onSurface }]}>{item.title}</Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>

                <SectionHeader
                    title="Recent Sales Orders"
                    actionLabel={orders.length > 0 ? "View All" : undefined}
                />
                {orders.length === 0 ? (
                    <Card style={[styles.activityCard, { backgroundColor: theme.colors.surface, borderRadius: 16 }]}>
                        <Card.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
                            <HugeiconsIcon icon={ShoppingBag01Icon} size={48} color={theme.colors.outlineVariant} />
                            <Text variant="bodyMedium" style={[styles.emptyActivity, { color: theme.colors.onSurfaceVariant }]}>No recent orders found</Text>
                            <Button mode="contained" onPress={() => router.push('/sales/create')} style={styles.createButton}>
                                Create First Order
                            </Button>
                        </Card.Content>
                    </Card>
                ) : (
                    orders.sort((a, b) => b.id - a.id).slice(0, 5).map((order) => {
                        const customer = customers.find(c => c.id === order.customerId);
                        return (
                            <SalesOrderItem
                                key={order.id}
                                orderId={order.id}
                                customerName={customer?.name || 'Walk-in Customer'}
                                totalAmount={order.totalAmount || 0}
                            />
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
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
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        alignItems: 'center',
        padding: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuLabel: {
        fontWeight: 'bold',
    },
    activityCard: {
        elevation: 1,
    },
    emptyActivity: {
        textAlign: 'center',
        marginVertical: 12,
    },
    createButton: {
        marginTop: 8,
        borderRadius: 12,
    },
});
