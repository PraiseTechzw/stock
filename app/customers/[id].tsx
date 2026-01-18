import { useCustomers } from '@/src/hooks/useCustomers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';

export default function CustomerDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { customers, updateCustomer, deleteCustomer } = useCustomers();
    const router = useRouter();
    const theme = useTheme();

    const customer = customers.find((c) => c.id === parseInt(id));

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
            });
        }
    }, [customer]);

    const handleUpdate = async () => {
        if (!form.name) return;

        try {
            await updateCustomer(parseInt(id), {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
            });
            router.back();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Customer',
            'Are you sure you want to delete this customer?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCustomer(parseInt(id));
                        router.back();
                    }
                },
            ]
        );
    };

    if (!customer) return null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Edit Customer' }} />
            <View style={styles.form}>
                <TextInput
                    label="Customer Name *"
                    mode="outlined"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                    label="Email Address"
                    mode="outlined"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    keyboardType="email-address"
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                    label="Phone Number"
                    mode="outlined"
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    keyboardType="phone-pad"
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />
                <TextInput
                    label="Billing Address"
                    mode="outlined"
                    value={form.address}
                    onChangeText={(text) => setForm({ ...form, address: text })}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                />

                <Button
                    mode="contained"
                    onPress={handleUpdate}
                    style={styles.saveButton}
                    contentStyle={styles.buttonContent}
                    disabled={!form.name}
                >
                    Update Profile
                </Button>

                <Button
                    mode="outlined"
                    onPress={handleDelete}
                    style={[styles.deleteButton, { borderColor: theme.colors.error }]}
                    labelStyle={{ color: theme.colors.error }}
                    contentStyle={styles.buttonContent}
                >
                    Delete Customer
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
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    saveButton: {
        marginTop: 24,
        borderRadius: 16,
        elevation: 4,
    },
    deleteButton: {
        marginTop: 12,
        borderRadius: 16,
    },
    buttonContent: {
        height: 56,
    },
});
