import { useCustomers } from '@/src/hooks/useCustomers';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useProducts } from '@/src/hooks/useProducts';
import { SaleItem, useSales } from '@/src/hooks/useSales';
import { useStock } from '@/src/hooks/useStock';
import {
    ArrowLeft02Icon,
    Calendar02Icon,
    CheckmarkCircle01Icon,
    CheckmarkCircle02Icon,
    Coins01Icon,
    CreditCardIcon,
    PackageIcon,
    StarIcon,
    UserIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Dialog, Divider, List, Portal, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function QuickSaleScreen() {
    const { createSalesOrder } = useSales();
    const { customers } = useCustomers();
    const { products } = useProducts();
    const { addNotification } = useNotifications();
    const { getStockForProduct } = useStock();
    const router = useRouter();
    const theme = useTheme();

    const [step, setStep] = useState(1);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'credit'>('paid');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [successVisible, setSuccessVisible] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<number | null>(null);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            // Favorites first
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [products]);

    const filteredProducts = useMemo(() =>
        sortedProducts.filter(p =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(productSearch.toLowerCase())
        ),
        [sortedProducts, productSearch]
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
            setCart([...cart, {
                productId: product.id,
                quantity: 1,
                price: product.sellingPrice || 0,
                discount: 0
            }]);
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

    const applyQuickDiscount = (productId: number, type: 'percent' | 'fixed', value: number) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const discount = type === 'percent' ? (item.price * item.quantity * (value / 100)) : value;
                return { ...item, discount };
            }
            return item;
        }));
    };

    const handleConfirmSale = async () => {
        if (cart.length === 0) return;
        try {
            const order = await createSalesOrder(
                selectedCustomerId,
                cart,
                0,
                paymentStatus,
                paymentStatus === 'credit' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
            );

            setLastOrderId(order.id);

            // 1. Automated Low Stock Check & Notification
            for (const item of cart) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    // Note: In a real app, we'd query the fresh stock level from DB after the sale
                    // but for immediate feedback we can estimate or use a hook.
                    // Here we'll just check if the product's minStockLevel is relevant.
                    if (product.minStockLevel && product.totalQuantity - item.quantity < product.minStockLevel) {
                        await addNotification(
                            'Low Stock Alert',
                            `${product.name} is running low (${product.totalQuantity - item.quantity} remaining).`,
                            'low_stock',
                            { productId: product.id }
                        );
                    }
                }
            }

            setSuccessVisible(true);
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Failed',
                text2: 'Could not settle transaction.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    const handleShareReceipt = async () => {
        if (!lastOrderId) return;
        try {
            // Reusing a simplified version of the invoice HTML
            const html = `<html><body><h1>Receipt #${lastOrderId}</h1><p>Total: $${cartTotal.toFixed(2)}</p></body></html>`;
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
        } catch (e) {
            Alert.alert('Error', 'Failed to generate receipt');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Quick Sale</Text>
                            <Text variant="bodyLarge" style={styles.userName}>New Transaction</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {step === 1 ? (
                // --- STEP 1: FAST PRODUCT PICKER ---
                <View style={{ flex: 1 }}>
                    <View style={styles.topBar}>
                        <Searchbar
                            placeholder="Find product..."
                            onChangeText={setProductSearch}
                            value={productSearch}
                            style={[styles.miniSearch, { backgroundColor: theme.colors.surface }]}
                            iconColor={theme.colors.primary}
                        />
                        <TouchableOpacity
                            style={[styles.customerChip, { backgroundColor: theme.colors.primaryContainer }]}
                            onPress={() => setStep(2)}
                        >
                            <HugeiconsIcon icon={UserIcon} size={16} color={theme.colors.primary} />
                            <Text variant="labelMedium" style={{ color: theme.colors.primary, marginLeft: 4 }}>
                                {selectedCustomer?.name || 'Walk-in'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.gridRow}
                        contentContainerStyle={styles.gridContainer}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                            const cartItem = cart.find(i => i.productId === item.id);
                            return (
                                <Animated.View entering={FadeInDown.delay(index * 50)}>
                                    <TouchableOpacity
                                        style={[
                                            styles.productCard,
                                            { backgroundColor: theme.colors.surface },
                                            cartItem && { borderColor: theme.colors.primary, borderWidth: 2 }
                                        ]}
                                        onPress={() => addToCart(item)}
                                    >
                                        {item.isFavorite && (
                                            <View style={styles.favoriteBadge}>
                                                <HugeiconsIcon icon={StarIcon} size={12} color="#ffd700" />
                                            </View>
                                        )}
                                        {cartItem && (
                                            <View style={styles.selectedTick}>
                                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color={theme.colors.primary} />
                                            </View>
                                        )}
                                        <View style={styles.imageBox}>
                                            {item.imageUri ? (
                                                <Image source={{ uri: item.imageUri }} style={styles.productImage} />
                                            ) : (
                                                <View style={[styles.pIconBg, { backgroundColor: theme.colors.primaryContainer + '40' }]}>
                                                    <HugeiconsIcon icon={PackageIcon} size={32} color={theme.colors.primary} />
                                                </View>
                                            )}
                                        </View>
                                        <Text variant="labelLarge" numberOfLines={1} style={styles.pName}>{item.name}</Text>
                                        <Text variant="bodyLarge" style={{ fontWeight: '900', color: theme.colors.primary }}>${item.sellingPrice}</Text>

                                        <View style={styles.stockStatus}>
                                            <Text variant="labelSmall" style={{ color: item.totalQuantity > 5 ? theme.colors.outline : theme.colors.error, fontWeight: '700' }}>
                                                {item.totalQuantity > 0 ? `${item.totalQuantity} in stock` : 'Out of Stock'}
                                            </Text>
                                        </View>

                                        {cartItem && (
                                            <View style={styles.cardActions}>
                                                <TouchableOpacity
                                                    onPress={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                                                    style={[styles.smallActionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                                                >
                                                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>-</Text>
                                                </TouchableOpacity>
                                                <View style={styles.qtyBadge}>
                                                    <Text style={{ fontWeight: 'bold' }}>{cartItem.quantity}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                                                    style={[styles.smallActionBtn, { backgroundColor: theme.colors.primary }]}
                                                >
                                                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#fff' }}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        }}
                    />

                    <Surface style={[styles.bottomSettle, { backgroundColor: theme.colors.surface }]} elevation={5}>
                        <View style={styles.settleInfo}>
                            <Text variant="labelSmall">TOTAL TO PAY</Text>
                            <Text variant="headlineSmall" style={{ fontWeight: '900', color: theme.colors.primary }}>${cartTotal.toFixed(2)}</Text>
                        </View>
                        <Button
                            mode="contained"
                            disabled={cart.length === 0}
                            style={styles.settleBtn}
                            contentStyle={{ height: 56 }}
                            onPress={() => setStep(3)}
                        >
                            Complete Sale
                        </Button>
                    </Surface>
                </View>
            ) : step === 2 ? (
                // --- STEP 2: CUSTOMER SELECT (PROMPT) ---
                <View style={[styles.stepContainer, { padding: 20 }]}>
                    <Text variant="headlineSmall" style={styles.stepTitle}>Who is buying?</Text>
                    <Button
                        mode="contained"
                        onPress={() => { setSelectedCustomerId(null); setStep(1); }}
                        style={styles.bigBtn}
                    >
                        Walk-in (Anonymous)
                    </Button>
                    <Divider style={{ marginVertical: 16 }} />
                    <Text variant="labelLarge" style={{ marginBottom: 12 }}>OR SELECT FREQUENT CUSTOMER</Text>
                    <FlatList
                        data={customers}
                        renderItem={({ item }) => (
                            <List.Item
                                title={item.name}
                                description={item.phone}
                                left={p => <List.Icon {...p} icon="account" />}
                                onPress={() => { setSelectedCustomerId(item.id); setStep(1); }}
                                style={{ backgroundColor: theme.colors.surface, borderRadius: 12, marginBottom: 8 }}
                            />
                        )}
                    />
                    <Button onPress={() => setStep(1)}>Cancel</Button>
                </View>
            ) : (
                // --- STEP 3: SETTLEMENT SCREEN ---
                <ScrollView contentContainerStyle={styles.settleScreen}>
                    <Surface style={styles.receiptHeader} elevation={0}>
                        <Text variant="labelLarge" style={styles.receiptSub}>TOTAL COLLECTABLE</Text>
                        <Text variant="displaySmall" style={styles.receiptTotal}>${cartTotal.toFixed(2)}</Text>
                    </Surface>

                    <Card style={styles.settleCard}>
                        <Card.Content>
                            <Text variant="labelLarge" style={styles.sectionLabel}>PAYMENT DETAILS</Text>

                            <View style={styles.methodGrid}>
                                {[
                                    { id: 'cash', label: 'USD Cash', icon: Coins01Icon },
                                    { id: 'eco_cash', label: 'EcoCash', icon: CreditCardIcon },
                                    { id: 'zipit', label: 'ZIPIT/Bank', icon: CheckmarkCircle02Icon }
                                ].map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        style={[
                                            styles.methodTab,
                                            { borderColor: paymentMethod === m.id ? theme.colors.primary : '#e2e8f0' },
                                            paymentMethod === m.id && { backgroundColor: theme.colors.primaryContainer + '40' }
                                        ]}
                                        onPress={() => setPaymentMethod(m.id)}
                                    >
                                        <HugeiconsIcon
                                            icon={m.icon}
                                            size={22}
                                            color={paymentMethod === m.id ? theme.colors.primary : '#94a3b8'}
                                        />
                                        <Text style={[
                                            styles.methodLabel,
                                            { color: paymentMethod === m.id ? theme.colors.primary : '#64748b' }
                                        ]}>{m.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.paymentToggleRow}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, paymentStatus === 'paid' && { backgroundColor: '#10b981' }]}
                                    onPress={() => setPaymentStatus('paid')}
                                >
                                    <Text style={[styles.toggleBtnText, paymentStatus === 'paid' && { color: '#fff' }]}>Fully Paid</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, paymentStatus === 'credit' && { backgroundColor: '#ef4444' }]}
                                    onPress={() => setPaymentStatus('credit')}
                                >
                                    <Text style={[styles.toggleBtnText, paymentStatus === 'credit' && { color: '#fff' }]}>Credit/IOU</Text>
                                </TouchableOpacity>
                            </View>

                            {paymentStatus === 'credit' && (
                                <Surface style={styles.iouBanner} elevation={0}>
                                    <HugeiconsIcon icon={Calendar02Icon} size={16} color="#ef4444" />
                                    <Text style={styles.iouText}>
                                        Payment due in 7 days. Reminder will be sent.
                                    </Text>
                                </Surface>
                            )}
                        </Card.Content>
                    </Card>

                    <Card style={[styles.settleCard, { marginTop: 16 }]}>
                        <Card.Content>
                            <View style={styles.summaryTop}>
                                <Text variant="labelLarge" style={styles.sectionLabel}>BILL SUMMARY</Text>
                                <Text style={styles.itemCount}>{cart.length} Items</Text>
                            </View>

                            {cart.map(item => {
                                const p = products.find(x => x.id === item.productId);
                                return (
                                    <View key={item.productId} style={styles.billItem}>
                                        <View style={styles.billItemInfo}>
                                            <Text style={styles.billItemName}>{p?.name}</Text>
                                            <Text style={styles.billItemQty}>{item.quantity} units @ ${item.price}</Text>
                                        </View>
                                        <Text style={styles.billItemPrice}>${(item.price * item.quantity - item.discount).toFixed(2)}</Text>
                                    </View>
                                );
                            })}

                            <Divider style={styles.billDivider} />

                            <View style={styles.finalTotalRow}>
                                <Text style={styles.finalTotalLabel}>Grand Total</Text>
                                <Text style={styles.finalTotalValue}>${cartTotal.toFixed(2)}</Text>
                            </View>
                        </Card.Content>
                    </Card>

                    <View style={styles.finalActions}>
                        <Button
                            mode="outlined"
                            style={styles.cancelBtn}
                            contentStyle={{ height: 56 }}
                            onPress={() => setStep(1)}
                        >
                            Back to Cart
                        </Button>
                        <Button
                            mode="contained"
                            style={styles.confirmBtn}
                            contentStyle={{ height: 56 }}
                            onPress={handleConfirmSale}
                        >
                            Finalize Order
                        </Button>
                    </View>
                </ScrollView>
            )}

            <Portal>
                <Dialog visible={successVisible} dismissable={false} style={{ borderRadius: 32, alignItems: 'center', paddingVertical: 20 }}>
                    <Animated.View entering={FadeIn}>
                        <Surface style={[styles.successIcon, { backgroundColor: '#10b981' }]} elevation={4}>
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color="#fff" />
                        </Surface>
                    </Animated.View>

                    <Text variant="headlineMedium" style={{ fontWeight: '900', marginTop: 20 }}>Sale Confirmed!</Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.6, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                        Transaction #${lastOrderId} has been recorded.
                    </Text>

                    <View style={styles.successActions}>
                        <Button
                            mode="contained"
                            onPress={handleShareReceipt}
                            style={styles.successBtn}
                            icon="share"
                        >
                            Share Receipt
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setSuccessVisible(false);
                                setCart([]);
                                setStep(1);
                            }}
                            style={[styles.successBtn, { borderColor: theme.colors.primary }]}
                        >
                            New Sale
                        </Button>
                        <Button
                            mode="text"
                            onPress={() => router.replace('/(tabs)/sales')}
                        >
                            Go to Sales History
                        </Button>
                    </View>
                </Dialog>
            </Portal>
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
    topBar: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        gap: 8,
    },
    miniSearch: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        elevation: 0,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    customerChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 22,
    },
    gridContainer: {
        padding: 8,
        paddingBottom: 120,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    productCard: {
        width: '48.5%',
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 1,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    selectedTick: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    favoriteBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    imageBox: {
        width: 80,
        height: 80,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    pIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    pName: {
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
        fontSize: 13,
    },
    stockStatus: {
        marginTop: 4,
    },
    bottomSettle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    settleInfo: {
        flex: 1,
    },
    settleBtn: {
        flex: 1.2,
        borderRadius: 16,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 20,
        color: '#1e293b',
    },
    bigBtn: {
        height: 60,
        justifyContent: 'center',
        borderRadius: 16,
    },
    settleScreen: {
        padding: 16,
        paddingBottom: 40,
    },
    receiptHeader: {
        paddingVertical: 32,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    receiptSub: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1.5,
        fontSize: 10,
    },
    receiptTotal: {
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 4,
    },
    settleCard: {
        borderRadius: 24,
        elevation: 1,
        backgroundColor: '#fff',
    },
    sectionLabel: {
        marginBottom: 16,
        color: '#94a3b8',
        fontSize: 10,
        letterSpacing: 1.5,
        fontWeight: '900',
    },
    methodGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    methodTab: {
        flex: 1,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 16,
    },
    methodLabel: {
        fontSize: 10,
        fontWeight: '900',
        marginTop: 6,
    },
    paymentToggleRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    toggleBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    toggleBtnText: {
        fontWeight: '900',
        fontSize: 13,
        color: '#64748b',
    },
    iouBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
    },
    iouText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    summaryTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemCount: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '700',
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    billItemInfo: {
        flex: 1,
    },
    billItemName: {
        fontWeight: '700',
        color: '#1e293b',
        fontSize: 14,
    },
    billItemQty: {
        fontSize: 12,
        color: '#64748b',
    },
    billItemPrice: {
        fontWeight: '900',
        color: '#1e293b',
    },
    billDivider: {
        marginVertical: 16,
        backgroundColor: '#e2e8f0',
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    finalTotalLabel: {
        fontSize: 16,
        fontWeight: '900',
        color: '#64748b',
    },
    finalTotalValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#6366f1',
    },
    finalActions: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 12,
        paddingBottom: 20,
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 16,
        borderColor: '#e2e8f0',
        borderWidth: 1.5,
    },
    confirmBtn: {
        flex: 2,
        borderRadius: 16,
        backgroundColor: '#6366f1',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successActions: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 32,
        gap: 12,
    },
    successBtn: {
        borderRadius: 16,
        height: 48,
        justifyContent: 'center',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    smallActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBadge: {
        minWidth: 20,
        alignItems: 'center',
    },
});
