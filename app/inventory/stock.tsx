import { useProducts } from '@/src/hooks/useProducts';
import { useStock } from '@/src/hooks/useStock';
import { ArrowLeft02Icon, PackageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, SegmentedButtons, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function StockManagementScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { products } = useProducts();
    const { locations, adjustStock, transferStock, getStockForProduct } = useStock();
    const router = useRouter();
    const theme = useTheme();

    const productId = typeof id === 'string' ? parseInt(id, 10) : 0;
    const product = products.find((p) => p.id === productId);
    const { data: stockLevels } = getStockForProduct(productId);

    const [mode, setMode] = useState('adjust');
    const [form, setForm] = useState({
        locationId: '',
        fromLocationId: '',
        toLocationId: '',
        quantity: '',
        reason: '',
    });

    React.useEffect(() => {
        if (locations && locations.length > 0 && !form.locationId) {
            setForm(prev => ({ ...prev, locationId: locations[0].id.toString() }));
        }
    }, [locations]);

    const handleAdjust = async () => {
        if (!form.locationId || !form.quantity || !productId) {
            return;
        }
        try {
            await adjustStock(
                productId,
                parseInt(form.locationId),
                parseInt(form.quantity),
                form.reason || 'Manual Adjustment'
            );

            Toast.show({
                type: 'success',
                text1: 'Stock Adjusted',
                text2: `Successfully updated ${product?.name} stock.`,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not adjust stock level.',
            });
        }
    };

    const handleTransfer = async () => {
        if (!form.fromLocationId || !form.toLocationId || !form.quantity || !productId) return;
        try {
            await transferStock(
                productId,
                parseInt(form.fromLocationId),
                parseInt(form.toLocationId),
                parseInt(form.quantity)
            );

            Toast.show({
                type: 'success',
                text1: 'Transfer Complete',
                text2: `Moved ${form.quantity} units of ${product?.name}.`,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Transfer Failed',
                text2: 'Could not complete stock transfer.',
            });
        }
    };

    if (!product) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Stock Control</Text>
                            <Text variant="bodyLarge" style={styles.userName}>{product.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Surface style={styles.stockSummary} elevation={2}>
                        <View style={styles.summaryHeader}>
                            <HugeiconsIcon icon={PackageIcon} size={20} color="#fff" />
                            <Text variant="titleSmall" style={{ color: '#fff', marginLeft: 8, fontWeight: '900' }}>TOTAL UNITS ON HAND</Text>
                        </View>
                        <View style={styles.summaryBody}>
                            {stockLevels?.map((level) => {
                                const loc = locations.find(l => l.id === level.locationId);
                                return (
                                    <View key={level.id} style={styles.summaryRow}>
                                        <Text style={styles.locationLabel}>{loc?.name || 'Store'}</Text>
                                        <Text style={styles.quantityText}>{level.quantity} units</Text>
                                    </View>
                                );
                            })}
                            {(!stockLevels || stockLevels.length === 0) && (
                                <Text style={{ color: '#fff', opacity: 0.6, textAlign: 'center' }}>No current stock recorded</Text>
                            )}
                        </View>
                    </Surface>

                    <SegmentedButtons
                        value={mode}
                        onValueChange={setMode}
                        buttons={[
                            { value: 'adjust', label: 'Restock / Adjust', icon: 'plus-minus' },
                            { value: 'transfer', label: 'Move Stock', icon: 'swap-horizontal' },
                        ]}
                        style={styles.segmented}
                    />

                    <Surface style={styles.formCard} elevation={1}>
                        {mode === 'adjust' ? (
                            <>
                                <Text variant="labelLarge" style={styles.inputLabel}>CHOOSE STORAGE LOCATION</Text>
                                <View style={styles.chipRow}>
                                    {locations.map((loc) => (
                                        <TouchableOpacity
                                            key={loc.id}
                                            onPress={() => setForm({ ...form, locationId: loc.id.toString() })}
                                            style={[
                                                styles.locationChip,
                                                form.locationId === loc.id.toString() && { backgroundColor: '#6366f1', borderColor: '#6366f1' }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                form.locationId === loc.id.toString() && { color: '#fff' }
                                            ]}>{loc.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    label="Quantity (+ add, - remove)"
                                    mode="outlined"
                                    placeholder="0"
                                    value={form.quantity}
                                    onChangeText={(text) => setForm({ ...form, quantity: text })}
                                    keyboardType="numeric"
                                    style={styles.premiumInput}
                                    outlineStyle={{ borderRadius: 16 }}
                                    activeOutlineColor="#6366f1"
                                    left={<TextInput.Icon icon="plus-thick" color="#6366f1" />}
                                />

                                <TextInput
                                    label="Reason / Note"
                                    mode="outlined"
                                    placeholder="e.g., Restock from supplier"
                                    value={form.reason}
                                    onChangeText={(text) => setForm({ ...form, reason: text })}
                                    style={styles.premiumInput}
                                    outlineStyle={{ borderRadius: 16 }}
                                />

                                <Button
                                    mode="contained"
                                    onPress={handleAdjust}
                                    style={styles.submitBtn}
                                    contentStyle={{ height: 56 }}
                                    labelStyle={{ fontWeight: '900' }}
                                >
                                    SAVE UNIT UPDATE
                                </Button>
                            </>
                        ) : (
                            <View style={styles.form}>
                                <Text variant="labelLarge" style={styles.inputLabel}>FROM LOCATION</Text>
                                <View style={styles.chipRow}>
                                    {locations.map((loc) => (
                                        <TouchableOpacity
                                            key={loc.id}
                                            onPress={() => setForm({ ...form, fromLocationId: loc.id.toString() })}
                                            style={[
                                                styles.locationChip,
                                                form.fromLocationId === loc.id.toString() && { backgroundColor: '#6366f1', borderColor: '#6366f1' }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                form.fromLocationId === loc.id.toString() && { color: '#fff' }
                                            ]}>{loc.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text variant="labelLarge" style={styles.inputLabel}>TO LOCATION</Text>
                                <View style={styles.chipRow}>
                                    {locations.map((loc) => (
                                        <TouchableOpacity
                                            key={loc.id}
                                            onPress={() => setForm({ ...form, toLocationId: loc.id.toString() })}
                                            style={[
                                                styles.locationChip,
                                                form.toLocationId === loc.id.toString() && { backgroundColor: '#6366f1', borderColor: '#6366f1' }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                form.toLocationId === loc.id.toString() && { color: '#fff' }
                                            ]}>{loc.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    label="How many units?"
                                    mode="outlined"
                                    value={form.quantity}
                                    onChangeText={(text) => setForm({ ...form, quantity: text })}
                                    keyboardType="numeric"
                                    style={styles.premiumInput}
                                    outlineStyle={{ borderRadius: 16 }}
                                    activeOutlineColor="#6366f1"
                                />
                                <Button
                                    mode="contained"
                                    onPress={handleTransfer}
                                    style={styles.submitBtn}
                                    contentStyle={{ height: 56 }}
                                    labelStyle={{ fontWeight: '900' }}
                                >
                                    MOVE UNITS
                                </Button>
                            </View>
                        )}
                    </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    stockSummary: {
        marginBottom: 32,
        borderRadius: 24,
        backgroundColor: '#6366f1',
        overflow: 'hidden',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 16,
    },
    summaryBody: {
        padding: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    locationLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    quantityText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16,
    },
    segmented: {
        marginBottom: 24,
    },
    formCard: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#fff',
    },
    inputLabel: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1,
        fontSize: 10,
        marginBottom: 12,
        marginTop: 8,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    locationChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    chipText: {
        fontWeight: '700',
        fontSize: 13,
        color: '#64748b',
    },
    premiumInput: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    submitBtn: {
        marginTop: 8,
        borderRadius: 16,
        backgroundColor: '#6366f1',
    },
    form: {
        gap: 4,
    },
});
