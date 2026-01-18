import { useProducts } from '@/src/hooks/useProducts';
import { useStock } from '@/src/hooks/useStock';
import { PackageIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, SegmentedButtons, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function StockManagementScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { products } = useProducts();
    const { locations, adjustStock, transferStock, getStockForProduct } = useStock();
    const router = useRouter();
    const theme = useTheme();

    const product = products.find((p) => p.id === parseInt(id));
    const { data: stockLevels } = getStockForProduct(parseInt(id));

    const [mode, setMode] = useState('adjust'); // adjust, transfer
    const [form, setForm] = useState({
        locationId: '',
        fromLocationId: '',
        toLocationId: '',
        quantity: '',
        reason: '',
    });

    const handleAdjust = async () => {
        if (!form.locationId || !form.quantity) return;
        try {
            await adjustStock(
                parseInt(id),
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
        if (!form.fromLocationId || !form.toLocationId || !form.quantity) return;
        try {
            await transferStock(
                parseInt(id),
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
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: `Stock Control` }} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.productTitle}>{product.name}</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Real-time stock management</Text>
                </View>

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
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    productTitle: {
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -0.5,
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
