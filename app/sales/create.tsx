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
    MinusSignIcon,
    PackageIcon,
    PlusSignIcon,
    Search01Icon,
    StarIcon,
    UserIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, Button, Card, Dialog, Divider, Portal, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

            for (const item of cart) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
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
                text1: 'Settlement Failed',
                text2: 'Could not finalize the transaction.',
            });
        }
    };

    const handleShareReceipt = async () => {
        if (!lastOrderId) return;
        try {
            const html = `<html><body style="padding:40px; font-family:sans-serif;">
                <h1 style="color:${theme.colors.primary}">Receipt #${lastOrderId}</h1>
                <hr/>
                <p>Status: ${paymentStatus.toUpperCase()}</p>
                <p>Customer: ${selectedCustomer?.name || 'Walk-in'}</p>
                <h2 style="text-align:right">Total: $${cartTotal.toFixed(2)}</h2>
            </body></html>`;
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
                            <Text variant="headlineMedium" style={styles.greeting}>Checkout</Text>
                            <Text variant="bodyLarge" style={styles.userName}>
                                {step === 1 ? 'Select products' : step === 2 ? 'Select customer' : 'Settlement'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {step === 1 && (
                <View style={{ flex: 1 }}>
                    <View style={styles.topBar}>
                        <Searchbar
                            placeholder="Find items..."
                            onChangeText={setProductSearch}
                            value={productSearch}
                            style={[styles.miniSearch, { backgroundColor: theme.colors.surfaceVariant + '40' }]}
                            icon={() => <HugeiconsIcon icon={Search01Icon} size={20} color={theme.colors.primary} />}
                            inputStyle={{ fontSize: 14 }}
                            elevation={0}
                        />
                        <TouchableOpacity
                            style={[styles.customerChip, { backgroundColor: theme.colors.primaryContainer }]}
                            onPress={() => setStep(2)}
                        >
                            <HugeiconsIcon icon={UserIcon} size={16} color={theme.colors.primary} />
                            <Text variant="labelLarge" style={{ color: theme.colors.primary, marginLeft: 8, fontWeight: '900' }}>
                                {selectedCustomer?.name?.split(' ')[0] || 'Walk-in'}
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
                                <Animated.View entering={FadeInDown.delay(index * 30)} style={{ width: '48.5%' }}>
                                    <TouchableOpacity
                                        style={[
                                            styles.productCard,
                                            { backgroundColor: theme.colors.surface },
                                            cartItem && { borderColor: theme.colors.primary, borderWidth: 1.5 }
                                        ]}
                                        onPress={() => addToCart(item)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.imageBox}>
                                            {item.imageUri ? (
                                                <Image source={{ uri: item.imageUri }} style={styles.productImage} />
                                            ) : (
                                                <View style={[styles.pIconBg, { backgroundColor: theme.colors.surfaceVariant }]}>
                                                    <HugeiconsIcon icon={PackageIcon} size={28} color={theme.colors.outline} />
                                                </View>
                                            )}
                                            {item.isFavorite && (
                                                <View style={styles.favoriteBadge}>
                                                    <HugeiconsIcon icon={StarIcon} size={10} color="#fff" />
                                                </View>
                                            )}
                                        </View>

                                        <Text variant="titleSmall" numberOfLines={1} style={styles.pName}>{item.name}</Text>
                                        <Text variant="labelLarge" style={{ fontWeight: '900', color: theme.colors.primary }}>${item.sellingPrice}</Text>

                                        <View style={styles.stockLabel}>
                                            <View style={[styles.dot, { backgroundColor: item.totalQuantity > 5 ? '#22c55e' : '#ef4444' }]} />
                                            <Text variant="labelSmall" style={{ color: theme.colors.outlineVariant }}>
                                                {item.totalQuantity} Units
                                            </Text>
                                        </View>

                                        {cartItem && (
                                            <View style={styles.cardActions}>
                                                <TouchableOpacity
                                                    onPress={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                                                    style={[styles.smallActionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                                                >
                                                    <HugeiconsIcon icon={MinusSignIcon} size={14} color="#000" />
                                                </TouchableOpacity>
                                                <View style={styles.qtyBadge}>
                                                    <Text style={{ fontWeight: '900' }}>{cartItem.quantity}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                                                    style={[styles.smallActionBtn, { backgroundColor: theme.colors.primary }]}
                                                >
                                                    <HugeiconsIcon icon={PlusSignIcon} size={14} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        }}
                    />

                    <Surface style={styles.bottomSettle} elevation={5}>
                        <View>
                            <Text variant="labelSmall" style={{ opacity: 0.6, fontWeight: '900' }}>TOTAL AMOUNT</Text>
                            <Text variant="headlineMedium" style={{ fontWeight: '900', color: theme.colors.primary, letterSpacing: -1 }}>
                                ${cartTotal.toFixed(2)}
                            </Text>
                        </View>
                        <Button
                            mode="contained"
                            disabled={cart.length === 0}
                            style={styles.settleBtn}
                            contentStyle={{ height: 56 }}
                            labelStyle={{ fontWeight: '900' }}
                            onPress={() => setStep(3)}
                        >
                            Checkout ({cart.length})
                        </Button>
                    </Surface>
                </View>
            )}

            {step === 2 && (
                <View style={styles.stepContainer}>
                    <View style={{ padding: 20 }}>
                        <Text variant="headlineSmall" style={styles.stepTitle}>Assign Customer</Text>
                        <TouchableOpacity
                            style={[styles.walkInCard, { backgroundColor: theme.colors.primaryContainer }]}
                            onPress={() => { setSelectedCustomerId(null); setStep(1); }}
                        >
                            <View style={styles.walkInIcon}>
                                <HugeiconsIcon icon={UserIcon} size={28} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Walk-in Customer</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.primary, opacity: 0.8 }}>No account creation needed</Text>
                            </View>
                        </TouchableOpacity>

                        <Divider style={{ marginVertical: 24 }} />
                        <Text variant="labelLarge" style={styles.sectionLabel}>FREQUENT CUSTOMERS</Text>
                    </View>

                    <FlatList
                        data={customers}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.customerItem, { backgroundColor: theme.colors.surface }]}
                                onPress={() => { setSelectedCustomerId(item.id); setStep(1); }}
                            >
                                <Surface style={styles.custAvatar} elevation={0}>
                                    <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{item.name[0]}</Text>
                                </Surface>
                                <View style={{ flex: 1 }}>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.outlineVariant }}>{item.phone}</Text>
                                </View>
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color={theme.colors.outlineVariant} />
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={<Button onPress={() => setStep(1)} style={{ marginTop: 20 }}>Go Back</Button>}
                    />
                </View>
            )}

            {step === 3 && (
                <ScrollView contentContainerStyle={styles.settleScreen} showsVerticalScrollIndicator={false}>
                    <Surface style={styles.receiptHeader} elevation={0}>
                        <Text variant="labelSmall" style={styles.receiptSub}>GRAND TOTAL DUE</Text>
                        <Text variant="displayMedium" style={styles.receiptTotal}>${cartTotal.toFixed(2)}</Text>
                        <View style={styles.custBadge}>
                            <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '900' }}>
                                For: {selectedCustomer?.name || 'Walk-in'}
                            </Text>
                        </View>
                    </Surface>

                    <Card style={styles.settleCard}>
                        <Card.Content>
                            <Text variant="labelLarge" style={styles.sectionLabel}>PAYMENT METHOD</Text>

                            <View style={styles.methodGrid}>
                                {[
                                    { id: 'cash', label: 'Cash', icon: Coins01Icon },
                                    { id: 'bank', label: 'Bank', icon: CreditCardIcon },
                                    { id: 'card', label: 'Card', icon: CheckmarkCircle02Icon }
                                ].map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        style={[
                                            styles.methodTab,
                                            { borderColor: paymentMethod === m.id ? theme.colors.primary : theme.colors.outlineVariant },
                                            paymentMethod === m.id && { backgroundColor: theme.colors.primaryContainer }
                                        ]}
                                        onPress={() => setPaymentMethod(m.id)}
                                    >
                                        <HugeiconsIcon
                                            icon={m.icon}
                                            size={22}
                                            color={paymentMethod === m.id ? theme.colors.primary : theme.colors.outline}
                                        />
                                        <Text style={[
                                            styles.methodLabel,
                                            { color: paymentMethod === m.id ? theme.colors.primary : theme.colors.outline }
                                        ]}>{m.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.paymentToggleRow}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, paymentStatus === 'paid' && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
                                    onPress={() => setPaymentStatus('paid')}
                                >
                                    <Text style={[styles.toggleBtnText, paymentStatus === 'paid' && { color: '#fff' }]}>Fully Paid</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, paymentStatus === 'credit' && { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                                    onPress={() => setPaymentStatus('credit')}
                                >
                                    <Text style={[styles.toggleBtnText, paymentStatus === 'credit' && { color: '#fff' }]}>IOU (Credit)</Text>
                                </TouchableOpacity>
                            </View>

                            {paymentStatus === 'credit' && (
                                <Surface style={styles.iouBanner} elevation={0}>
                                    <HugeiconsIcon icon={Calendar02Icon} size={18} color="#ef4444" />
                                    <Text style={styles.iouText}>
                                        Payment will be expected within 7 days.
                                    </Text>
                                </Surface>
                            )}
                        </Card.Content>
                    </Card>

                    <Card style={[styles.settleCard, { marginTop: 16 }]}>
                        <Card.Content>
                            <View style={styles.summaryTop}>
                                <Text variant="labelLarge" style={styles.sectionLabel}>ORDER SUMMARY</Text>
                                <Badge style={{ backgroundColor: theme.colors.primaryContainer, color: theme.colors.primary, fontWeight: 'bold' }} children={`${cart.length} ITEMS`} />
                            </View>

                            {cart.map(item => {
                                const p = products.find(x => x.id === item.productId);
                                return (
                                    <View key={item.productId} style={styles.billItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.billItemName}>{p?.name}</Text>
                                            <Text style={styles.billItemQty}>{item.quantity} units x ${item.price}</Text>
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
                            Modify Order
                        </Button>
                        <Button
                            mode="contained"
                            style={styles.confirmBtn}
                            contentStyle={{ height: 56 }}
                            labelStyle={{ fontWeight: '900' }}
                            onPress={handleConfirmSale}
                        >
                            Finalize Settlement
                        </Button>
                    </View>
                </ScrollView>
            )}

            <Portal>
                <Dialog visible={successVisible} dismissable={false} style={{ borderRadius: 32, padding: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Surface style={[styles.successIcon, { backgroundColor: '#22c55e' }]} elevation={4}>
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={56} color="#fff" />
                        </Surface>
                        <Text variant="headlineMedium" style={{ fontWeight: '900', marginTop: 24, textAlign: 'center' }}>Success!</Text>
                        <Text variant="bodyLarge" style={{ opacity: 0.6, textAlign: 'center', marginTop: 8 }}>
                            Transaction recorded as #{lastOrderId}
                        </Text>
                    </View>

                    <View style={styles.successActions}>
                        <Button
                            mode="contained"
                            onPress={handleShareReceipt}
                            style={styles.successBtn}
                            contentStyle={{ height: 48 }}
                        >
                            Share Receipt
                        </Button>
                        <Button
                            mode="contained-tonal"
                            onPress={() => {
                                setSuccessVisible(false);
                                setCart([]);
                                setStep(1);
                            }}
                            style={styles.successBtn}
                            contentStyle={{ height: 48 }}
                        >
                            New Sale
                        </Button>
                        <Button
                            mode="text"
                            onPress={() => router.replace('/(tabs)/sales')}
                            style={{ marginTop: 8 }}
                        >
                            Dashboard
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
        paddingHorizontal: 20,
        paddingBottom: 16,
        alignItems: 'center',
        gap: 12,
    },
    miniSearch: {
        flex: 1,
        height: 48,
        borderRadius: 16,
    },
    customerChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 16,
    },
    gridContainer: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productCard: {
        padding: 12,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 1,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    imageBox: {
        width: '100%',
        height: 90,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    pIconBg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#fbbf24',
        padding: 4,
        borderRadius: 8,
    },
    pName: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
        textAlign: 'center',
    },
    stockLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    smallActionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBadge: {
        minWidth: 20,
        alignItems: 'center',
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
        backgroundColor: '#fff',
    },
    settleBtn: {
        flex: 1,
        borderRadius: 16,
        marginLeft: 24,
        backgroundColor: '#6366f1',
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    walkInCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 16,
    },
    walkInIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionLabel: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1.5,
        fontSize: 10,
        marginBottom: 16,
    },
    customerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        gap: 16,
    },
    custAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settleScreen: {
        padding: 20,
        paddingBottom: 40,
    },
    receiptHeader: {
        paddingVertical: 40,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    receiptSub: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 2,
        fontSize: 11,
    },
    receiptTotal: {
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -2,
    },
    custBadge: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    settleCard: {
        borderRadius: 28,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    methodGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    methodTab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 20,
    },
    methodLabel: {
        fontSize: 11,
        fontWeight: '900',
        marginTop: 8,
    },
    paymentToggleRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    toggleBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
        backgroundColor: '#f1f5f9',
    },
    toggleBtnText: {
        fontWeight: '900',
        fontSize: 14,
        color: '#64748b',
    },
    iouBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#fef2f2',
    },
    iouText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    summaryTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    billItemName: {
        fontWeight: 'bold',
        color: '#1e293b',
        fontSize: 15,
    },
    billItemQty: {
        fontSize: 13,
        color: '#64748b',
    },
    billItemPrice: {
        fontWeight: '900',
        fontSize: 16,
        color: '#1e293b',
    },
    billDivider: {
        marginVertical: 20,
        height: 1.5,
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    finalTotalLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: '#94a3b8',
    },
    finalTotalValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#4f46e5',
        letterSpacing: -1,
    },
    finalActions: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 12,
        paddingBottom: 20,
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 18,
    },
    confirmBtn: {
        flex: 1.5,
        borderRadius: 18,
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
        marginTop: 32,
        gap: 12,
    },
    successBtn: {
        borderRadius: 16,
    },
});
