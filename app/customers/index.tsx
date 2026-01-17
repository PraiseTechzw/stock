import { useCustomers } from '@/src/hooks/useCustomers';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, FAB, Searchbar, Text, useTheme } from 'react-native-paper';

export default function CustomersScreen() {
    const { customers, isLoading } = useCustomers();
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const theme = useTheme();

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.phone && c.phone.includes(searchQuery))
        );
    }, [customers, searchQuery]);

    const renderCustomer = ({ item }: { item: any }) => (
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/customers/${item.id}` as any)}
        >
            <Card.Title
                title={item.name}
                titleStyle={{ fontWeight: 'bold' }}
                subtitle={item.phone || item.email || 'No contact info'}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                left={(props) => (
                    <Avatar.Text
                        {...props}
                        label={item.name.substring(0, 2).toUpperCase()}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        color={theme.colors.primary}
                    />
                )}
            />
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Customers' }} />
            <Searchbar
                placeholder="Search customers..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
                iconColor={theme.colors.primary}
            />

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCustomer}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <HugeiconsIcon icon={UserIcon} size={64} color={theme.colors.outlineVariant} />
                            <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                                No customers found
                            </Text>
                        </View>
                    }
                />
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/customers/add')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchbar: {
        margin: 16,
        borderRadius: 12,
        elevation: 0,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
        borderRadius: 16,
        elevation: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
