import { useCustomers } from '@/src/hooks/useCustomers';
import { useProducts } from '@/src/hooks/useProducts';
import { SaleItem, useSales } from '@/src/hooks/useSales';
import { MinusSignIcon, PackageIcon, PlusSignIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function CreateSalesOrderScreen() {
    const { createSalesOrder } = useSales();
    const { customers } = useCustomers();
    const { products } = useProducts();
    const router = useRouter();
    const theme = useTheme();

    const [step, setStep] = useState(1);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const filteredCustomers = useMemo(() =>
        customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())),
        [customers, customerSearch]
    );

    const filteredProducts = useMemo(() =>
        products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())),
        [products, productSearch]
    );

    const cartTotal = useMemo(() =>
        cart.reduce((sum, item) => sum + (item.price * item.quantity) - item.discount, 0),
        [cart]
    );

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { productId: product.id, quantity: 1, price: product.sellingPrice || 0, discount: 0 }]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCreateOrder = async () => {
        if (!selectedCustomerId || cart.length === 0) return;
        try {
            await createSalesOrder(selectedCustomerId, cart);

            Toast.show({
                type: 'success',
                text1: 'Sale Confirmed',
                text2: `Order for ${selectedCustomer?.name} has been placed.`,
                position: 'bottom',
                bottomOffset: 40,
            });

            router.replace('/(tabs)/sales');
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Checkout Failed',
                text2: 'Could not process sales order.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: `New Sale` }} />

            <View style={styles.headerProgress}>
                {[1, 2, 3].map(s => (
                    <View
                        key={s}
                        style={[
                            styles.progressDot,
                            { backgroundColor: step >= s ? theme.colors.primary : theme.colors.outlineVariant }
                        ]}
                    />
                ))}
            </View>

            {step === 1 && (
                <View style={styles.stepContainer}>
                    <View style={styles.padding}>
                        <Text variant="headlineSmall" style={styles.stepTitle}>Select Customer</Text>
                        <Searchbar
                            placeholder="Search by name..."
                            onChangeText={setCustomerSearch}
                            value={customerSearch}
                            style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
                            iconColor={theme.colors.primary}
                        />
                    </View>
                    <FlatList
                        data={filteredCustomers}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listPadding}
                        renderItem={({ item }) => (
                            <Card
                                style={[styles.customerCard, { backgroundColor: theme.colors.surface }]}
                                onPress={() => {
                                    setSelectedCustomerId(item.id);
                                    setStep(2);
                                }}
                            >
                                <Card.Title
                                    title={item.name}
                                    titleStyle={{ fontWeight: 'bold' }}
                                    subtitle={item.phone || 'No phone'}
                                    left={(props) => (
                                        <List.Icon {...props} icon="account-circle-outline" color={theme.colors.primary} />
                                    )}
                                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                                />
                            </Card>
                        )}
                    />
                </View>
            )}

            {step === 2 && (
                <View style={styles.stepContainer}>
                    <View style={styles.padding}>
                        <Text variant="headlineSmall" style={styles.stepTitle}>Add Products</Text>
                        <Searchbar
                            placeholder="Search name or SKU..."
                            onChangeText={setProductSearch}
                            value={productSearch}
                            style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
                            iconColor={theme.colors.primary}
                        />
                    </View>
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listPadding}
                        renderItem={({ item }) => {
                            const cartItem = cart.find(i => i.productId === item.id);
                            return (
                                <Card
                                    style={[styles.customerCard, { backgroundColor: theme.colors.surface }]}
                                    onPress={() => addToCart(item)}
                                >
                                    <Card.Title
                                        title={item.name}
                                        titleStyle={{ fontWeight: 'bold' }}
                                        subtitle={`$${item.sellingPrice} | SKU: ${item.sku}`}
                                        left={(props) => (
                                            <List.Icon {...props} icon={() => <HugeiconsIcon icon={PackageIcon} size={24} color={theme.colors.primary} />} />
                                        )}
                                        right={(props) => (
                                            <View style={styles.qtyAction}>
                                                {cartItem && (
                                                    <Surface style={[styles.qtyBadge, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
                                                        <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                                            {cartItem.quantity}
                                                        </Text>
                                                    </Surface>
                                                )}
                                                <IconButton icon={() => <HugeiconsIcon icon={PlusSignIcon} size={24} color={theme.colors.primary} />} />
                                            </View>
                                        )}
                                    />
                                </Card>
                            );
                        }}
                    />
                    <Surface style={[styles.cartPreview, { backgroundColor: theme.colors.surface }]} elevation={4}>
                        <View style={styles.cartPreviewContent}>
                            <View>
                                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{cart.length} items selected</Text>
                                <Text variant="titleLarge" style={{ fontWeight: '900', color: theme.colors.primary }}>${cartTotal.toFixed(2)}</Text>
                            </View>
                            <Button
                                mode="contained"
                                onPress={() => setStep(3)}
                                disabled={cart.length === 0}
                                style={{ borderRadius: 12 }}
                                contentStyle={{ height: 48, paddingHorizontal: 16 }}
                            >
                                Checkout
                            </Button>
                        </View>
                    </Surface>
                </View>
            )}

            {step === 3 && (
                <View style={styles.stepContainer}>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listPadding}>
                        <Text variant="headlineSmall" style={[styles.stepTitle, { marginLeft: 16 }]}>Review Order</Text>

                        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content>
                                <View style={styles.customerHeader}>
                                    <View style={{ marginRight: 12 }}>
                                        <HugeiconsIcon icon={UserIcon} size={24} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text variant="labelSmall">Customer</Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{selectedCustomer?.name}</Text>
                                    </View>
                                </View>

                                <Divider style={{ marginVertical: 20 }} />

                                <Text variant="labelSmall" style={{ marginBottom: 16, fontWeight: 'bold' }}>CART ITEMS</Text>
                                {cart.map((item) => {
                                    const product = products.find(p => p.id === item.productId);
                                    return (
                                        <View key={item.productId} style={styles.cartItemRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{product?.name}</Text>
                                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>${item.price} per unit</Text>
                                            </View>
                                            <View style={styles.qtyControls}>
                                                <IconButton
                                                    icon={() => <HugeiconsIcon icon={MinusSignIcon} size={18} color={theme.colors.primary} />}
                                                    onPress={() => updateQuantity(item.productId, -1)}
                                                    style={{ backgroundColor: theme.colors.primaryContainer }}
                                                />
                                                <Text variant="titleMedium" style={{ marginHorizontal: 8, fontWeight: 'bold' }}>{item.quantity}</Text>
                                                <IconButton
                                                    icon={() => <HugeiconsIcon icon={PlusSignIcon} size={18} color={theme.colors.primary} />}
                                                    onPress={() => updateQuantity(item.productId, 1)}
                                                    style={{ backgroundColor: theme.colors.primaryContainer }}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}

                                <Divider style={{ marginVertical: 20 }} />

                                <View style={styles.totalRow}>
                                    <Text variant="titleMedium">Grand Total</Text>
                                    <Text variant="headlineMedium" style={{ fontWeight: '900', color: theme.colors.primary }}>${cartTotal.toFixed(2)}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </ScrollView>

                    <View style={styles.actionsBox}>
                        <Button
                            mode="outlined"
                            style={styles.actionBtn}
                            onPress={() => setStep(2)}
                            contentStyle={{ height: 56 }}
                        >
                            Back
                        </Button>
                        <Button
                            mode="contained"
                            style={styles.actionBtn}
                            onPress={handleCreateOrder}
                            contentStyle={{ height: 56 }}
                        >
                            Confirm Sale
                        </Button>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerProgress: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    progressDot: {
        width: 24,
        height: 4,
        borderRadius: 2,
    },
    stepContainer: {
        flex: 1,
    },
    padding: {
        padding: 20,
    },
    stepTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    searchbar: {
        borderRadius: 12,
        elevation: 0,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    listPadding: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    customerCard: {
        marginBottom: 12,
        borderRadius: 16,
        elevation: 1,
    },
    qtyAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartPreview: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    cartPreviewContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryCard: {
        borderRadius: 24,
        elevation: 1,
        marginHorizontal: 16,
    },
    customerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cartItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionsBox: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 16,
    },
});
