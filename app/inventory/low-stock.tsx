import { useStock } from '@/src/hooks/useStock';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';

export default function LowStockScreen() {
    const { lowStockProducts } = useStock();
    const router = useRouter();
    const theme = useTheme();

    const renderProduct = ({ item }: { item: any }) => (
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.error }]}
            onPress={() => router.push(`/inventory/${item.id}`)}
        >
            <Card.Title
                title={item.name}
                titleStyle={{ fontWeight: 'bold' }}
                subtitle={`SKU: ${item.sku} | Min Alert Level: ${item.minStockLevel}`}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                left={(props) => (
                    <Avatar.Icon
                        {...props}
                        icon="alert-octagon"
                        color={theme.colors.error}
                        style={{ backgroundColor: theme.colors.errorContainer }}
                    />
                )}
            />
            <Card.Content>
                <View style={styles.alertIndicator}>
                    <Text variant="labelLarge" style={{ color: theme.colors.error, fontWeight: '900' }}>
                        STOCK CRITICAL
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Items require immediate restock
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Critical Alerts' }} />
            <FlatList
                data={lowStockProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProduct}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Avatar.Icon
                            icon="check-circle"
                            size={80}
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.primary}
                        />
                        <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurface }]}>All Stock Levels Stable</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>No items are currently below minimum levels.</Text>
                    </View>
                }
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
        paddingBottom: 40,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
        borderLeftWidth: 6,
    },
    alertIndicator: {
        marginTop: 4,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 20,
        fontWeight: 'bold',
    },
});
