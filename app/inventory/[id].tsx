import { Can } from '@/src/components/auth/Can';
import { BarcodeScannerModal } from '@/src/components/BarcodeScannerModal';
import { useProducts } from '@/src/hooks/useProducts';
import { Camera01Icon, CheckmarkCircle01Icon, Delete02Icon, Image01Icon, QrCode01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, List, Surface, Switch, Text, TextInput, useTheme } from 'react-native-paper';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { products, updateProduct, deleteProduct } = useProducts();
    const router = useRouter();
    const theme = useTheme();

    const product = products.find((p) => p.id === parseInt(id));

    const [scannerVisible, setScannerVisible] = useState(false);
    const [form, setForm] = useState({
        sku: '',
        name: '',
        description: '',
        costPrice: '',
        sellingPrice: '',
        barcode: '',
        imageUri: '',
        isActive: true,
        isFavorite: false,
    });

    useEffect(() => {
        if (product) {
            setForm({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                costPrice: product.costPrice?.toString() || '',
                sellingPrice: product.sellingPrice?.toString() || '',
                barcode: product.barcode || '',
                imageUri: product.imageUri || '',
                isActive: !!product.isActive,
                isFavorite: !!product.isFavorite,
            });
        }
    }, [product]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setForm({ ...form, imageUri: result.assets[0].uri });
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setForm({ ...form, imageUri: result.assets[0].uri });
        }
    };

    const handleUpdate = async () => {
        if (!form.sku || !form.name) return;

        try {
            await updateProduct(parseInt(id), {
                sku: form.sku,
                name: form.name,
                description: form.description,
                costPrice: parseFloat(form.costPrice) || 0,
                sellingPrice: parseFloat(form.sellingPrice) || 0,
                barcode: form.barcode,
                imageUri: form.imageUri,
                isActive: form.isActive,
                isFavorite: form.isFavorite,
            });
            router.back();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteProduct(parseInt(id));
                        router.back();
                    }
                },
            ]
        );
    };

    if (!product) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Product not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Edit Product' }} />
            <View style={styles.formContainer}>
                <Surface style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
                    {form.imageUri ? (
                        <>
                            <Image source={{ uri: form.imageUri }} style={styles.image} />
                            <IconButton
                                icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color="#fff" />}
                                style={styles.removeImage}
                                onPress={() => setForm({ ...form, imageUri: '' })}
                            />
                        </>
                    ) : (
                        <View style={styles.placeholder}>
                            <HugeiconsIcon icon={Image01Icon} size={48} color={theme.colors.outline} />
                            <Text variant="labelLarge" style={{ color: theme.colors.outline, marginTop: 8 }}>
                                No Product Image
                            </Text>
                        </View>
                    )}
                </Surface>

                <View style={styles.imageActions}>
                    <Button
                        mode="outlined"
                        onPress={pickImage}
                        icon={() => <HugeiconsIcon icon={Image01Icon} size={18} color={theme.colors.primary} />}
                        style={styles.actionBtn}
                    >
                        Gallery
                    </Button>
                    <Button
                        mode="contained"
                        onPress={takePhoto}
                        icon={() => <HugeiconsIcon icon={Camera01Icon} size={18} color="#fff" />}
                        style={styles.actionBtn}
                    >
                        Camera
                    </Button>
                </View>

                {/* Stock Summary Section */}
                <Surface style={styles.statsSurface} elevation={1}>
                    <View style={styles.statItem}>
                        <Text variant="labelSmall" style={styles.statLabel}>STOCK LEVEL</Text>
                        <Text variant="headlineSmall" style={[styles.statValue, { color: product.totalQuantity > 0 ? theme.colors.primary : theme.colors.error }]}>
                            {product.totalQuantity} <Text style={{ fontSize: 14 }}>units</Text>
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text variant="labelSmall" style={styles.statLabel}>DAILY SALES</Text>
                        <Text variant="headlineSmall" style={styles.statValue}>---</Text>
                    </View>
                </Surface>

                <Button
                    mode="contained"
                    icon="database-plus"
                    onPress={() => router.push(`/inventory/stock?id=${id}` as any)}
                    style={styles.stockEntryBtn}
                    contentStyle={{ height: 50 }}
                >
                    Add / Adjust Stock Units
                </Button>

                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Product Information</Text>
                </View>

                <TextInput
                    label="SKU *"
                    mode="outlined"
                    value={form.sku}
                    onChangeText={(text) => setForm({ ...form, sku: text })}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                    label="Product Name *"
                    mode="outlined"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                    label="Description"
                    mode="outlined"
                    value={form.description}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />

                <View style={styles.row}>
                    <TextInput
                        label="Cost Price"
                        mode="outlined"
                        value={form.costPrice}
                        onChangeText={(text) => setForm({ ...form, costPrice: text })}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        activeOutlineColor={theme.colors.primary}
                    />
                    <TextInput
                        label="Selling Price"
                        mode="outlined"
                        value={form.sellingPrice}
                        onChangeText={(text) => setForm({ ...form, sellingPrice: text })}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        activeOutlineColor={theme.colors.primary}
                    />
                </View>

                <View style={styles.row}>
                    <TextInput
                        label="Barcode"
                        mode="outlined"
                        value={form.barcode}
                        onChangeText={(text) => setForm({ ...form, barcode: text })}
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        activeOutlineColor={theme.colors.primary}
                    />
                    <IconButton
                        icon={() => <HugeiconsIcon icon={QrCode01Icon} size={24} color={theme.colors.primary} />}
                        onPress={() => setScannerVisible(true)}
                        style={{ marginTop: 8, backgroundColor: theme.colors.primaryContainer }}
                    />
                </View>

                <List.Item
                    title="Fast Selling (Favorite)"
                    description="Pinned to the top of Quick Sale screen"
                    left={props => <HugeiconsIcon icon={StarIcon} size={24} color={form.isFavorite ? '#fbbf24' : theme.colors.outline} style={{ margin: 10 }} />}
                    right={() => (
                        <Switch
                            value={form.isFavorite}
                            onValueChange={(v) => setForm({ ...form, isFavorite: v })}
                            color={theme.colors.primary}
                        />
                    )}
                    style={{ backgroundColor: theme.colors.surfaceVariant + '40', borderRadius: 16, marginTop: 8 }}
                />

                <BarcodeScannerModal
                    visible={scannerVisible}
                    onClose={() => setScannerVisible(false)}
                    onScan={(data: string) => setForm({ ...form, barcode: data, sku: form.sku || data })}
                />

                <Can perform="manage-inventory">
                    <View style={styles.actions}>
                        <Button
                            mode="contained"
                            onPress={handleUpdate}
                            icon={() => <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#fff" />}
                            style={[styles.actionButton, { backgroundColor: '#6366f1' }]}
                            contentStyle={styles.buttonContent}
                            disabled={!form.sku || !form.name}
                        >
                            Save Product Changes
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={handleDelete}
                            icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color={theme.colors.error} />}
                            style={[styles.actionButton, { borderColor: theme.colors.error, borderWidth: 1.5 }]}
                            labelStyle={{ color: theme.colors.error, fontWeight: '900' }}
                            contentStyle={styles.buttonContent}
                        >
                            Delete Product
                        </Button>
                    </View>
                </Can>

                <Can perform="manage-inventory" fallback={
                    <Surface style={[styles.readOnlyNote, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            You have read-only access to this product.
                        </Text>
                    </Surface>
                }>
                    <View />
                </Can>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
        paddingBottom: 60,
    },
    imageContainer: {
        width: '100%',
        height: 240,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 28,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    removeImage: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    imageActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 14,
    },
    statsSurface: {
        flexDirection: 'row',
        paddingVertical: 20,
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1,
        fontSize: 10,
        marginBottom: 4,
    },
    statValue: {
        fontWeight: '900',
    },
    divider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    stockEntryBtn: {
        marginBottom: 32,
        borderRadius: 16,
        backgroundColor: '#6366f1',
    },
    sectionHeader: {
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#6366f1',
        paddingLeft: 12,
    },
    sectionTitle: {
        fontWeight: '900',
        color: '#1e293b',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actions: {
        marginTop: 32,
        gap: 12,
    },
    actionButton: {
        borderRadius: 16,
    },
    buttonContent: {
        height: 54,
    },
    readOnlyNote: {
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
