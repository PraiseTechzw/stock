import { BarcodeScannerModal } from '@/src/components/BarcodeScannerModal';
import { useProducts } from '@/src/hooks/useProducts';
import { Camera01Icon, Delete02Icon, Image01FreeIcons, Image01Icon, QrCode01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function AddProductScreen() {
    const { addProduct } = useProducts();
    const router = useRouter();
    const theme = useTheme();

    const [scannerVisible, setScannerVisible] = useState(false);
    const [form, setForm] = useState({
        sku: '',
        name: '',
        description: '',
        costPrice: '',
        sellingPrice: '',
        barcode: '',
        imageUri: '',
    });

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

    const handleSave = async () => {
        if (!form.sku || !form.name) return;

        try {
            await addProduct({
                sku: form.sku,
                name: form.name,
                description: form.description,
                costPrice: parseFloat(form.costPrice) || 0,
                sellingPrice: parseFloat(form.sellingPrice) || 0,
                barcode: form.barcode,
                imageUri: form.imageUri,
                isActive: true,
            });

            Toast.show({
                type: 'success',
                text1: 'Product Created',
                text2: `${form.name} has been added to inventory.`,
                position: 'bottom',
                bottomOffset: 40,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: 'Could not create product. Please try again.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.form}>
                <Surface style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
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
                            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                                No Product Image
                            </Text>
                        </View>
                    )}
                </Surface>

                <View style={styles.imageActions}>
                    <Button
                        mode="outlined"
                        onPress={pickImage}
                        icon={() => <HugeiconsIcon icon={Image01FreeIcons} size={18} color={theme.colors.primary} />}
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

                <BarcodeScannerModal
                    visible={scannerVisible}
                    onClose={() => setScannerVisible(false)}
                    onScan={(data) => setForm({ ...form, barcode: data, sku: form.sku || data })}
                />

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                    disabled={!form.sku || !form.name}
                >
                    Create Product
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        padding: 20,
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
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
        borderRadius: 24,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    removeImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    imageActions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 12,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        marginTop: 16,
        borderRadius: 16,
        elevation: 4,
    },
    saveButtonContent: {
        height: 56,
    },
});
