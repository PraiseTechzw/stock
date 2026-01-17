import { useExpenses } from '@/src/hooks/useExpenses';
import { Camera01Icon, Delete02Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, List, Portal, RadioButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';
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
                position: 'bottom',
                bottomOffset: 40,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: 'Could not record expense. Please try again.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    const isValid = form.amount && !isNaN(parseFloat(form.amount));

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'New Expense' }} />
            <View style={styles.formContainer}>

                <Surface style={[styles.imageContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
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
                            <HugeiconsIcon icon={Image01Icon} size={48} color={theme.colors.outline} />
                            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                                No Receipt Image
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
                        labelStyle={{ fontSize: 13 }}
                    >
                        Gallery
                    </Button>
                    <Button
                        mode="contained"
                        onPress={takePhoto}
                        icon={() => <HugeiconsIcon icon={Camera01Icon} size={18} color="#fff" />}
                        style={styles.actionBtn}
                        labelStyle={{ fontSize: 13 }}
                    >
                        Camera
                    </Button>
                </View>

                <TextInput
                    label="Amount *"
                    mode="outlined"
                    value={form.amount}
                    onChangeText={(text) => setForm({ ...form, amount: text })}
                    keyboardType="numeric"
                    style={styles.input}
                    left={<TextInput.Affix text="$" />}
                    activeOutlineColor={theme.colors.primary}
                    error={form.amount !== '' && isNaN(parseFloat(form.amount))}
                />

                <List.Item
                    title="Expense Category"
                    titleStyle={{ fontWeight: 'bold' }}
                    description={form.category}
                    onPress={() => setCatDialogVisible(true)}
                    left={props => <List.Icon {...props} icon="tag-outline" color={theme.colors.primary} />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    style={[styles.categoryPicker, { backgroundColor: theme.colors.surface }]}
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

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                    disabled={!isValid}
                >
                    {isValid ? 'Record Expense' : 'Enter Valid Amount'}
                </Button>

                <Portal>
                    <Dialog
                        visible={catDialogVisible}
                        onDismiss={() => setCatDialogVisible(false)}
                        style={{ borderRadius: 24 }}
                    >
                        <Dialog.Title style={{ fontWeight: 'bold' }}>Select Category</Dialog.Title>
                        <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
                            <ScrollView>
                                <RadioButton.Group
                                    onValueChange={value => {
                                        setForm({ ...form, category: value });
                                        setCatDialogVisible(false);
                                    }}
                                    value={form.category}
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <List.Item
                                            key={cat}
                                            title={cat}
                                            onPress={() => {
                                                setForm({ ...form, category: cat });
                                                setCatDialogVisible(false);
                                            }}
                                            right={() => <RadioButton value={cat} />}
                                            style={{ paddingVertical: 4 }}
                                        />
                                    ))}
                                </RadioButton.Group>
                            </ScrollView>
                        </Dialog.ScrollArea>
                    </Dialog>
                </Portal>
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
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 180,
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
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 14,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    categoryPicker: {
        borderRadius: 16,
        marginBottom: 16,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
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
