import { useExpenses } from '@/src/hooks/useExpenses';
import { ArrowLeft02Icon, Camera01Icon, CheckmarkCircle01Icon, Delete02Icon, Image01Icon, Note01Icon, Tag01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, RadioButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const EXPENSE_CATEGORIES = [
    'Rent',
    'Utilities',
    'Salaries',
    'Supplies',
    'Marketing',
    'Taxes',
    'Other'
];

export default function AddExpenseScreen() {
    const { addExpense } = useExpenses();
    const router = useRouter();
    const theme = useTheme();

    const [form, setForm] = useState({
        amount: '',
        category: 'Other',
        description: '',
        receiptImageUri: '',
    });
    const [catDialogVisible, setCatDialogVisible] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setForm({ ...form, receiptImageUri: result.assets[0].uri });
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setForm({ ...form, receiptImageUri: result.assets[0].uri });
        }
    };

    const handleSave = async () => {
        if (!form.amount || isNaN(parseFloat(form.amount))) return;

        try {
            await addExpense({
                amount: parseFloat(form.amount),
                category: form.category,
                description: form.description,
                receiptImageUri: form.receiptImageUri,
                date: new Date().toISOString(),
            });

            Toast.show({
                type: 'success',
                text1: 'Expense Recorded',
                text2: `$${form.amount} for ${form.category} was saved.`,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: 'Could not record expense. Please try again.',
            });
        }
    };

    const isValid = form.amount && !isNaN(parseFloat(form.amount));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>New Expense</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Log business spending</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Surface style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant + '40' }]} elevation={0}>
                        {form.receiptImageUri ? (
                            <>
                                <Image source={{ uri: form.receiptImageUri }} style={styles.image} />
                                <IconButton
                                    icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color="#fff" />}
                                    style={styles.removeImage}
                                    onPress={() => setForm({ ...form, receiptImageUri: '' })}
                                />
                            </>
                        ) : (
                            <View style={styles.placeholder}>
                                <HugeiconsIcon icon={Image01Icon} size={48} color={theme.colors.outlineVariant} />
                                <Text variant="labelLarge" style={{ color: theme.colors.outline, marginTop: 12, fontWeight: '700' }}>
                                    No Receipt Attached
                                </Text>
                            </View>
                        )}
                    </Surface>

                    <View style={styles.imageActions}>
                        <Button
                            mode="outlined"
                            onPress={pickImage}
                            icon={() => <HugeiconsIcon icon={Image01Icon} size={18} color={theme.colors.primary} />}
                            style={[styles.actionBtn, { borderColor: theme.colors.primaryContainer }]}
                            contentStyle={{ height: 48 }}
                            labelStyle={{ fontWeight: '900' }}
                        >
                            Gallery
                        </Button>
                        <Button
                            mode="contained"
                            onPress={takePhoto}
                            icon={() => <HugeiconsIcon icon={Camera01Icon} size={18} color="#fff" />}
                            style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                            contentStyle={{ height: 48 }}
                            labelStyle={{ fontWeight: '900' }}
                        >
                            Camera
                        </Button>
                    </View>

                    <TextInput
                        label="Amount Spent *"
                        mode="outlined"
                        value={form.amount}
                        onChangeText={(text) => setForm({ ...form, amount: text })}
                        keyboardType="numeric"
                        style={styles.input}
                        activeOutlineColor={theme.colors.primary}
                        outlineStyle={{ borderRadius: 16 }}
                        left={<TextInput.Affix text="$" textStyle={{ fontWeight: '900', color: theme.colors.primary }} />}
                        error={form.amount !== '' && isNaN(parseFloat(form.amount))}
                    />

                    <TouchableOpacity
                        style={[styles.categoryPicker, { backgroundColor: theme.colors.surface }]}
                        onPress={() => setCatDialogVisible(true)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer + '30' }]}>
                            <HugeiconsIcon icon={Tag01Icon} size={20} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text variant="labelSmall" style={{ color: '#64748b', fontWeight: '900' }}>CATEGORY</Text>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{form.category}</Text>
                        </View>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={20} color={theme.colors.outlineVariant} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    <TextInput
                        label="Description / Purpose"
                        mode="outlined"
                        value={form.description}
                        onChangeText={(text) => setForm({ ...form, description: text })}
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                        activeOutlineColor={theme.colors.primary}
                        outlineStyle={{ borderRadius: 16 }}
                        left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Note01Icon} size={20} color={theme.colors.outline} />} />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        disabled={!isValid}
                        style={[styles.saveButton, { backgroundColor: isValid ? '#6366f1' : theme.colors.surfaceVariant }]}
                        contentStyle={{ height: 56 }}
                        labelStyle={{ fontWeight: '900' }}
                        icon={() => <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#fff" />}
                    >
                        {isValid ? 'Record Expense' : 'Invalid Amount'}
                    </Button>

                    <Portal>
                        <Dialog
                            visible={catDialogVisible}
                            onDismiss={() => setCatDialogVisible(false)}
                            style={{ borderRadius: 32, padding: 8 }}
                        >
                            <Dialog.Title style={{ fontWeight: '900', textAlign: 'center' }}>Select Category</Dialog.Title>
                            <Dialog.ScrollArea style={{ paddingHorizontal: 0, maxHeight: 400 }}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <RadioButton.Group
                                        onValueChange={value => {
                                            setForm({ ...form, category: value });
                                            setCatDialogVisible(false);
                                        }}
                                        value={form.category}
                                    >
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={styles.catItem}
                                                onPress={() => {
                                                    setForm({ ...form, category: cat });
                                                    setCatDialogVisible(false);
                                                }}
                                            >
                                                <Text variant="titleMedium" style={{ fontWeight: form.category === cat ? '900' : '600', color: form.category === cat ? theme.colors.primary : '#1e293b' }}>{cat}</Text>
                                                <RadioButton value={cat} />
                                            </TouchableOpacity>
                                        ))}
                                    </RadioButton.Group>
                                </ScrollView>
                            </Dialog.ScrollArea>
                        </Dialog>
                    </Portal>
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
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.05)',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
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
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    categoryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        marginTop: 16,
        borderRadius: 18,
    },
    catItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 24,
    }
});
