import { ArrowLeft02Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SalesOrderItem } from '@/src/components/ui/SalesOrderItem';
import { useCustomers } from '@/src/hooks/useCustomers';
import { useSales } from '@/src/hooks/useSales';

export default function SalesHistoryScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { orders } = useSales();
    const { customers } = useCustomers();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = orders
        .filter(order => {
            const customer = customers.find(c => c.id === order.customerId);
            const customerName = customer?.name || 'Walk-in Customer';
            return (
                customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toString().includes(searchQuery)
            );
        })
        .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Sales History</Text>
                            <Text variant="bodyLarge" style={styles.userName}>{orders.length} transactions total</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Searchbar
                    placeholder="Search customer or ID..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    icon={() => <HugeiconsIcon icon={Search01Icon} size={20} color={theme.colors.onSurfaceVariant} />}
                />
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const customer = customers.find(c => c.id === item.customerId);
                    return (
                        <SalesOrderItem
                            orderId={item.id}
                            customerName={customer?.name || 'Walk-in Customer'}
                            totalAmount={item.totalAmount || 0}
                            paymentStatus={item.paymentStatus as any}
                            date={item.created_at || undefined}
                            onPress={() => router.push(`/sales/${item.id}`)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>No orders found</Text>
                    </View>
                }
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
        marginBottom: 16,
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
    searchBar: {
        elevation: 0,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        height: 48,
    },
    listContent: {
        padding: 20,
        gap: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
});
