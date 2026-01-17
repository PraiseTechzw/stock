import { useProducts } from '@/src/hooks/useProducts';
import { PackageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, FAB, Searchbar, Text, useTheme } from 'react-native-paper';

export default function InventoryScreen() {
    const { products, isLoading } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const theme = useTheme();

    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const renderProduct = ({ item }: { item: any }) => (
        <Card
            style={styles.card}
            onPress={() => router.push(`/inventory/${item.id}`)}
        >
            <Card.Title
                title={item.name}
                titleStyle={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                subtitle={`SKU: ${item.sku} | Price: $${item.sellingPrice}`}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                left={(props) => (
                    item.imageUri ? (
                        <Avatar.Image {...props} source={{ uri: item.imageUri }} />
                    ) : (
                        <Avatar.Icon
                            {...props}
                            icon="package-variant-closed"
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.primary}
                        />
                    )
                )}
            />
            <Card.Content>
                <View style={styles.stockInfo}>
                    <Text variant="bodySmall">Category ID: {item.categoryId || 'N/A'}</Text>
                    {/* Stock levels would come from a separate query or join */}
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search products..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
                    iconColor={theme.colors.primary}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    inputStyle={{ color: theme.colors.onSurface }}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProduct}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <HugeiconsIcon icon={PackageIcon} size={64} color={theme.colors.outlineVariant} />
                            <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                                No products found
                            </Text>
                        </View>
                    }
                />
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/inventory/add')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 8,
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
    stockInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
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
