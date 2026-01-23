import { useCustomers } from '@/src/hooks/useCustomers';
import { ArrowLeft02Icon, CallIcon, CheckmarkCircle01Icon, Delete02Icon, Location01Icon, Mail01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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
            Toast.show({
                type: 'success',
                text1: 'Changes Saved',
                text2: `${form.name} profile has been updated.`,
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
            'Delete Customer',
            'Are you sure you want to delete this customer? This will remove their entire profile.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Profile',
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Edit Profile</Text>
                            <Text variant="bodyLarge" style={styles.userName}>{customer.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarPlaceholder}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Text style={{ fontSize: 40, fontWeight: '900', color: theme.colors.primary }}>{customer.name[0]}</Text>
                    </View>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 12 }}>
                        CUSTOMER PROFILE
                    </Text>
                </View>

                <TextInput
                    label="Full Name *"
                    mode="outlined"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={{ borderRadius: 16 }}
                    left={<TextInput.Icon icon={() => <HugeiconsIcon icon={UserIcon} size={20} color={theme.colors.outline} />} />}
                />
                <TextInput
                    label="Email Address"
                    mode="outlined"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    keyboardType="email-address"
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={{ borderRadius: 16 }}
                    left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Mail01Icon} size={20} color={theme.colors.outline} />} />}
                />
                <TextInput
                    label="Phone Number"
                    mode="outlined"
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    keyboardType="phone-pad"
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={{ borderRadius: 16 }}
                    left={<TextInput.Icon icon={() => <HugeiconsIcon icon={CallIcon} size={20} color={theme.colors.outline} />} />}
                />
                <TextInput
                    label="Service Address"
                    mode="outlined"
                    value={form.address}
                    onChangeText={(text) => setForm({ ...form, address: text })}
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={{ borderRadius: 16 }}
                    left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Location01Icon} size={20} color={theme.colors.outline} />} />}
                />

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        style={styles.saveBtn}
                        contentStyle={{ height: 56 }}
                        labelStyle={{ fontWeight: '900' }}
                        icon={() => <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#fff" />}
                    >
                        Save Profile Changes
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={handleDelete}
                        style={styles.deleteBtn}
                        labelStyle={{ color: theme.colors.error, fontWeight: '900' }}
                        contentStyle={{ height: 56 }}
                        icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color={theme.colors.error} />}
                    >
                        Delete Profile
                    </Button>
                </View>
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
    form: {
        padding: 24,
        paddingBottom: 60,
    },
    avatarPlaceholder: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    actions: {
        marginTop: 24,
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
});
