import { MainHeader } from '@/src/components/ui/MainHeader';
import { useProducts } from '@/src/hooks/useProducts';
import { Alert02Icon, ArrowRight01Icon, PackageIcon, PlusSignIcon, Search01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, FAB, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
    const { products, isLoading, error } = useProducts();
    const theme = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toString() === searchQuery
        );
    }, [products, searchQuery]);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const getStockStatus = (quantity: number, minLevel: number | null) => {
        if (quantity === 0) return { label: 'Out', color: theme.colors.error, bg: theme.colors.errorContainer };
        if (minLevel && quantity < minLevel) return { label: 'Low', color: '#f57c00', bg: '#fff3e0' };
        return { label: 'Good', color: '#2e7d32', bg: '#e8f5e9' };
    };

    const renderProduct = ({ item }: { item: any }) => {
        const status = getStockStatus(item.totalQuantity, item.minStockLevel);

        return (
            <Surface elevation={1} style={styles.surfaceCard}>
                <TouchableOpacity
                    onPress={() => router.push(`/inventory/${item.id}`)}
                    style={styles.cardTouch}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.imageBox}>
                            {item.imageUri ? (
                                <Image source={{ uri: item.imageUri }} style={styles.productImage} />
                            ) : (
                                <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <HugeiconsIcon icon={PackageIcon} size={28} color={theme.colors.outline} />
                                </View>
                            )}
                            {item.isFavorite && (
                                <View style={styles.favoriteBadge}>
                                    <HugeiconsIcon icon={StarIcon} size={14} color="#fff" />
                                </View>
                            )}
                        </View>

                        <View style={styles.infoContent}>
                            <View style={styles.titleRow}>
                                <Text numberOfLines={1} variant="titleMedium" style={styles.productTitle}>
                                    {item.name}
                                </Text>
                                <Text variant="titleMedium" style={[styles.priceTag, { color: theme.colors.primary }]}>
                                    ${item.sellingPrice}
                                </Text>
                            </View>

                            <Text variant="labelSmall" style={styles.skuText}>
                                SKU: {item.sku}
                            </Text>

                            <View style={styles.footerRow}>
                                <View style={styles.stockCounter}>
                                    <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
                                    <Text variant="labelMedium" style={{ fontWeight: 'bold' }}>
                                        {item.totalQuantity} <Text style={{ fontWeight: '400', color: theme.colors.outline }}>in stock</Text>
                                    </Text>
                                </View>
                                <View style={[styles.badgeTag, { backgroundColor: status.bg }]}>
                                    <Text variant="labelSmall" style={{ color: status.color, fontWeight: '900' }}>
                                        {status.label.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.arrowBox}>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={theme.colors.outlineVariant} />
                        </View>
                    </View>
                </TouchableOpacity>
            </Surface>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <MainHeader title="Inventory" />
            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
                <Searchbar
                    placeholder="Search inventory..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.premiumSearch, { backgroundColor: theme.colors.surfaceVariant + '40' }]}
                    icon={() => <HugeiconsIcon icon={Search01Icon} size={20} color={theme.colors.primary} />}
                    inputStyle={styles.searchInput}
                    elevation={0}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <HugeiconsIcon icon={Alert02Icon} size={48} color={theme.colors.error} />
                    <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: 12 }}>Connection Lost</Text>
                    <Text variant="bodySmall" style={{ marginBottom: 16 }}>Unable to load your inventory</Text>
                    <Button mode="contained" onPress={() => router.replace('/inventory' as any)}>Retry Connection</Button>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProduct}
                    contentContainerStyle={styles.listContent}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <HugeiconsIcon icon={PackageIcon} size={64} color={theme.colors.outlineVariant} />
                            <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                                {products.length === 0 ? 'Inventory is empty' : 'No matches found'}
                            </Text>
                            {products.length === 0 && (
                                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
                                    Try adding your first product using the + button.
                                </Text>
                            )}
                        </View>
                    }
                />
            )}

            <FAB
                icon={() => <HugeiconsIcon icon={PlusSignIcon} size={24} color="#fff" />}
                style={styles.fab}
                onPress={() => router.push('/inventory/add')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    premiumSearch: {
        borderRadius: 16,
        height: 48,
    },
    searchInput: {
        fontSize: 15,
        minHeight: 0,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        paddingTop: 8,
    },
    surfaceCard: {
        marginBottom: 12,
        borderRadius: 20,
        overflow: 'hidden',
    },
    cardTouch: {
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageBox: {
        width: 70,
        height: 70,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#fbbf24',
        borderRadius: 8,
        padding: 2,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    infoContent: {
        flex: 1,
        marginLeft: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productTitle: {
        fontWeight: '900',
        maxWidth: '70%',
        letterSpacing: -0.2,
    },
    priceTag: {
        fontWeight: '900',
    },
    skuText: {
        color: '#94a3b8',
        marginTop: 2,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    stockCounter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    badgeTag: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    arrowBox: {
        marginLeft: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: '#6366f1',
    },
});
