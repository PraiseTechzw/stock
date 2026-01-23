import { useCustomers } from '@/src/hooks/useCustomers';
import { ArrowLeft02Icon, CallIcon, Location01Icon, Mail01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            });

            router.back();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not create customer profile.',
            });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>New Profile</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Customer Directory</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarPlaceholder}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                        <HugeiconsIcon icon={UserIcon} size={42} color={theme.colors.primary} />
                    </View>
                    <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '900', marginTop: 12 }}>
                        IDENTITY INFO
                    </Text>
                </View>

                <TextInput
                    label="Customer Full Name *"
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
                    label="Physical Address"
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

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={{ fontWeight: '900' }}
                    disabled={!form.name}
                >
                    Create Profile
                </Button>
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
    button: {
        marginTop: 24,
        borderRadius: 18,
        backgroundColor: '#6366f1',
    },
    buttonContent: {
        height: 56,
    },
});
