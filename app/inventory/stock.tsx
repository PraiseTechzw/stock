import { useProducts } from '@/src/hooks/useProducts';
import { useStock } from '@/src/hooks/useStock';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, List, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
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
                position: 'bottom',
                bottomOffset: 40,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not adjust stock level.',
                position: 'bottom',
                bottomOffset: 40,
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
                position: 'bottom',
                bottomOffset: 40,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Transfer Failed',
                text2: 'Could not complete stock transfer.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    if (!product) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: `Manage Stock` }} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{product.name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>SKU: {product.sku}</Text>
                </View>

                <Card style={[styles.card, { backgroundColor: theme.colors.primary, borderRadius: 24 }]}>
                    <Card.Content style={{ padding: 20 }}>
                        <Text variant="titleMedium" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', marginBottom: 16 }}>Current Stock Levels</Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 8 }}>
                            {stockLevels?.map((level) => {
                                const loc = locations.find(l => l.id === level.locationId);
                                return (
                                    <List.Item
                                        key={level.id}
                                        title={loc?.name || 'Unknown Location'}
                                        titleStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        right={() => <Text variant="titleLarge" style={{ color: '#fff', fontWeight: '900' }}>{level.quantity}</Text>}
                                    />
                                );
                            })}
                            {stockLevels?.length === 0 && (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', opacity: 0.7 }}>No stock recorded in any location</Text>
                                </View>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                <SegmentedButtons
                    value={mode}
                    onValueChange={setMode}
                    buttons={[
                        { value: 'adjust', label: 'Adjust' },
                        { value: 'transfer', label: 'Transfer' },
                    ]}
                    style={styles.segmented}
                />

                {mode === 'adjust' ? (
                    <View style={styles.form}>
                        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>SELECT LOCATION</Text>
                        <View style={styles.locationList}>
                            {locations.map((loc) => (
                                <Button
                                    key={loc.id}
                                    mode={form.locationId === loc.id.toString() ? 'contained' : 'outlined'}
                                    onPress={() => setForm({ ...form, locationId: loc.id.toString() })}
                                    style={styles.locationButton}
                                    labelStyle={{ fontSize: 12 }}
                                    compact
                                >
                                    {loc.name}
                                </Button>
                            ))}
                        </View>

                        <TextInput
                            label="Quantity (+ to add, - to remove)"
                            mode="outlined"
                            value={form.quantity}
                            onChangeText={(text) => setForm({ ...form, quantity: text })}
                            keyboardType="numeric"
                            style={styles.input}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="Reason (e.g. Damage, Restock)"
                            mode="outlined"
                            value={form.reason}
                            onChangeText={(text) => setForm({ ...form, reason: text })}
                            style={styles.input}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <Button
                            mode="contained"
                            onPress={handleAdjust}
                            style={styles.actionButton}
                            contentStyle={styles.buttonContent}
                        >
                            Confirm Adjustment
                        </Button>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>FROM LOCATION</Text>
                        <View style={styles.locationList}>
                            {locations.map((loc) => (
                                <Button
                                    key={loc.id}
                                    mode={form.fromLocationId === loc.id.toString() ? 'contained' : 'outlined'}
                                    onPress={() => setForm({ ...form, fromLocationId: loc.id.toString() })}
                                    style={styles.locationButton}
                                    labelStyle={{ fontSize: 12 }}
                                    compact
                                >
                                    {loc.name}
                                </Button>
                            ))}
                        </View>

                        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>TO LOCATION</Text>
                        <View style={styles.locationList}>
                            {locations.map((loc) => (
                                <Button
                                    key={loc.id}
                                    mode={form.toLocationId === loc.id.toString() ? 'contained' : 'outlined'}
                                    onPress={() => setForm({ ...form, toLocationId: loc.id.toString() })}
                                    style={styles.locationButton}
                                    labelStyle={{ fontSize: 12 }}
                                    compact
                                >
                                    {loc.name}
                                </Button>
                            ))}
                        </View>

                        <TextInput
                            label="Quantity to Transfer"
                            mode="outlined"
                            value={form.quantity}
                            onChangeText={(text) => setForm({ ...form, quantity: text })}
                            keyboardType="numeric"
                            style={styles.input}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <Button
                            mode="contained"
                            onPress={handleTransfer}
                            style={styles.actionButton}
                            contentStyle={styles.buttonContent}
                        >
                            Transfer Stock
                        </Button>
                    </View>
                )}
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
    card: {
        marginBottom: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    segmented: {
        marginBottom: 24,
    },
    form: {
        gap: 8,
    },
    label: {
        marginBottom: 12,
        fontWeight: '900',
        letterSpacing: 1,
        fontSize: 10,
    },
    locationList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 8,
    },
    locationButton: {
        borderRadius: 10,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    actionButton: {
        marginTop: 12,
        borderRadius: 16,
        elevation: 4,
    },
    buttonContent: {
        height: 56,
    },
});
