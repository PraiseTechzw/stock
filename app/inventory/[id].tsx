import { Can } from '@/src/components/auth/Can';
import { BarcodeScannerModal } from '@/src/components/BarcodeScannerModal';
import { useProducts } from '@/src/hooks/useProducts';
import { ArrowLeft02Icon, Camera01Icon, Database01Icon, Delete02Icon, Image01Icon, InformationCircleIcon, QrCode01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, List, Surface, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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
            Toast.show({
                type: 'success',
                text1: 'Changes Saved',
                text2: 'Product updated successfully.',
            });
            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'Could not save changes.',
            });
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
            <SafeAreaView style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Product not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Edit Info</Text>
                            <Text variant="bodyLarge" style={styles.userName}>{product.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
                <Surface style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant + '40' }]} elevation={0}>
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
                        contentStyle={{ height: 44 }}
                    >
                        Gallery
                    </Button>
                    <Button
                        mode="contained"
                        onPress={takePhoto}
                        icon={() => <HugeiconsIcon icon={Camera01Icon} size={18} color="#fff" />}
                        style={styles.actionBtn}
                        contentStyle={{ height: 44 }}
                    >
                        Camera
                    </Button>
                </View>

                <Surface style={styles.statsSurface} elevation={1}>
                    <View style={styles.statItem}>
                        <Text variant="labelSmall" style={styles.statLabel}>CURRENT STOCK</Text>
                        <Text variant="headlineSmall" style={[styles.statValue, { color: product.totalQuantity > 5 ? theme.colors.primary : '#ef4444' }]}>
                            {product.totalQuantity} <Text style={{ fontSize: 13, fontWeight: '400' }}>units</Text>
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text variant="labelSmall" style={styles.statLabel}>STOCK VALUE</Text>
                        <Text variant="headlineSmall" style={styles.statValue}>
                            ${((product.costPrice || 0) * product.totalQuantity).toFixed(2)}
                        </Text>
                    </View>
                </Surface>

                <Button
                    mode="contained-tonal"
                    icon={() => <HugeiconsIcon icon={Database01Icon} size={20} color={theme.colors.primary} />}
                    onPress={() => router.push(`/inventory/stock?id=${id}` as any)}
                    style={styles.stockEntryBtn}
                    contentStyle={{ height: 56 }}
                >
                    Update Stock Inventory
                </Button>

                <View style={styles.sectionHeader}>
                    <HugeiconsIcon icon={InformationCircleIcon} size={20} color={theme.colors.primary} />
                    <Text variant="titleMedium" style={styles.sectionTitle}>General Details</Text>
                </View>

                <TextInput
                    label="SKU / Item Code"
                    mode="outlined"
                    value={form.sku}
                    onChangeText={(text) => setForm({ ...form, sku: text })}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                />
                <TextInput
                    label="Display Name"
                    mode="outlined"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                />
                <TextInput
                    label="Description"
                    mode="outlined"
                    value={form.description}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    outlineStyle={{ borderRadius: 16 }}
                />

                <View style={styles.row}>
                    <TextInput
                        label="Cost ($)"
                        mode="outlined"
                        value={form.costPrice}
                        onChangeText={(text) => setForm({ ...form, costPrice: text })}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        outlineStyle={{ borderRadius: 16 }}
                    />
                    <TextInput
                        label="Selling ($)"
                        mode="outlined"
                        value={form.sellingPrice}
                        onChangeText={(text) => setForm({ ...form, sellingPrice: text })}
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        outlineStyle={{ borderRadius: 16 }}
                    />
                </View>

                <View style={styles.row}>
                    <TextInput
                        label="Barcode"
                        mode="outlined"
                        value={form.barcode}
                        onChangeText={(text) => setForm({ ...form, barcode: text })}
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        outlineStyle={{ borderRadius: 16 }}
                    />
                    <IconButton
                        icon={() => <HugeiconsIcon icon={QrCode01Icon} size={24} color={theme.colors.primary} />}
                        onPress={() => setScannerVisible(true)}
                        style={{ backgroundColor: theme.colors.primaryContainer, borderRadius: 12, margin: 0, height: 56, width: 56 }}
                    />
                </View>

                <List.Item
                    title="Mark as Favorite"
                    description="Pinned to Checkout screen"
                    left={props => <HugeiconsIcon icon={StarIcon} size={24} color={form.isFavorite ? '#fbbf24' : theme.colors.outline} style={{ margin: 10 }} />}
                    right={() => (
                        <Switch
                            value={form.isFavorite}
                            onValueChange={(v) => setForm({ ...form, isFavorite: v })}
                            color={theme.colors.primary}
                        />
                    )}
                    style={styles.switchItem}
                />

                <BarcodeScannerModal
                    visible={scannerVisible}
                    onClose={() => setScannerVisible(false)}
                    onScan={(data) => setForm({ ...form, barcode: data, sku: form.sku || data })}
                />

                <Can perform="manage-inventory">
                    <View style={styles.actions}>
                        <Button
                            mode="contained"
                            onPress={handleUpdate}
                            style={styles.saveBtn}
                            contentStyle={{ height: 56 }}
                            labelStyle={{ fontWeight: '900' }}
                            disabled={!form.sku || !form.name}
                        >
                            Save Changes
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={handleDelete}
                            style={styles.deleteBtn}
                            labelStyle={{ color: theme.colors.error, fontWeight: '900' }}
                            contentStyle={{ height: 56 }}
                        >
                            Delete Product
                        </Button>
                    </View>
                </Can>

                <Can perform="manage-inventory" fallback={
                    <Surface style={styles.readOnlyNote} elevation={0}>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.6 }}>
                            You have read-only access to this catalog item.
                        </Text>
                    </Surface>
                }>
                    <View />
                </Can>
            </ScrollView>
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
    formContainer: {
        padding: 20,
        paddingBottom: 60,
    },
    imageContainer: {
        width: '100%',
        height: 220,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
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
        borderRadius: 16,
    },
    statsSurface: {
        flexDirection: 'row',
        paddingVertical: 20,
        borderRadius: 24,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1.2,
        fontSize: 10,
        marginBottom: 6,
    },
    statValue: {
        fontWeight: '900',
        color: '#1e293b',
    },
    divider: {
        width: 1,
        height: '50%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    stockEntryBtn: {
        marginBottom: 32,
        borderRadius: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    sectionTitle: {
        fontWeight: '900',
        color: '#000',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginTop: 8,
        paddingVertical: 8,
    },
    actions: {
        marginTop: 32,
        gap: 12,
    },
    saveBtn: {
        borderRadius: 18,
        backgroundColor: '#6366f1',
    },
    deleteBtn: {
        borderRadius: 18,
        borderColor: '#fee2e2',
        backgroundColor: '#fff5f5',
    },
    readOnlyNote: {
        marginTop: 24,
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
