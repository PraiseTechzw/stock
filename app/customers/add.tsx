import { useCustomers } from '@/src/hooks/useCustomers';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function AddCustomerScreen() {
    const { addCustomer } = useCustomers();
    const router = useRouter();
    const theme = useTheme();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const handleSave = async () => {
        if (!form.name) return;

        try {
            await addCustomer({
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
            });

            Toast.show({
                type: 'success',
                text1: 'Customer Created',
                text2: `${form.name} profile has been saved.`,
                position: 'bottom',
                bottomOffset: 40,
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not create customer profile.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'New Customer' }} />
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
                    onPress={handleSave}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    disabled={!form.name}
                >
                    Create Customer Profile
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
    button: {
        marginTop: 16,
        borderRadius: 16,
        elevation: 4,
    },
    buttonContent: {
        height: 56,
    },
});
