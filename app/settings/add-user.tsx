import { useUserManagement } from '@/src/hooks/useUserManagement';
import { ArrowLeft02Icon, Mail01Icon, PlusSignIcon, Shield01Icon, UserIcon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, HelperText, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function AddUserScreen() {
    const { addUser } = useUserManagement();
    const router = useRouter();
    const theme = useTheme();

    const [form, setForm] = useState({
        username: '',
        fullName: '',
        password: '',
        role: 'staff' as 'admin' | 'manager' | 'staff',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secureText, setSecureText] = useState(true);

    const handleAddUser = async () => {
        if (!form.username || !form.fullName || !form.password) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await addUser(form.username, form.fullName, form.password, form.role);
            Toast.show({
                type: 'success',
                text1: 'User Created',
                text2: `${form.fullName} has been added as ${form.role}.`,
            });
            router.back();
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to add user. Username might already exist.');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: e.message || 'Failed to add user.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>New User</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Create staff account</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={0}>
                        <Card.Content style={{ padding: 24 }}>
                            <TextInput
                                label="Full Name *"
                                mode="outlined"
                                value={form.fullName}
                                onChangeText={(text) => setForm({ ...form, fullName: text })}
                                style={styles.input}
                                activeOutlineColor={theme.colors.primary}
                                outlineStyle={{ borderRadius: 16 }}
                                left={<TextInput.Icon icon={() => <HugeiconsIcon icon={UserIcon} size={20} color={theme.colors.outline} />} />}
                            />
                            <TextInput
                                label="Username *"
                                mode="outlined"
                                value={form.username}
                                onChangeText={(text) => setForm({ ...form, username: text })}
                                style={styles.input}
                                autoCapitalize="none"
                                activeOutlineColor={theme.colors.primary}
                                outlineStyle={{ borderRadius: 16 }}
                                left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Mail01Icon} size={20} color={theme.colors.outline} />} />}
                            />
                            <TextInput
                                label="Password *"
                                mode="outlined"
                                value={form.password}
                                onChangeText={(text) => setForm({ ...form, password: text })}
                                style={styles.input}
                                secureTextEntry={secureText}
                                activeOutlineColor={theme.colors.primary}
                                outlineStyle={{ borderRadius: 16 }}
                                left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Shield01Icon} size={20} color={theme.colors.outline} />} />}
                                right={<TextInput.Icon icon={() => <HugeiconsIcon icon={secureText ? ViewIcon : ViewOffSlashIcon} size={20} color={theme.colors.outline} />} onPress={() => setSecureText(!secureText)} />}
                            />

                            <Divider style={{ marginVertical: 24 }} />

                            <Text variant="labelLarge" style={styles.sectionLabel}>ASSIGN SYSTEM ROLE</Text>
                            <RadioButton.Group
                                onValueChange={(value) => setForm({ ...form, role: value as any })}
                                value={form.role}
                            >
                                {[
                                    { val: 'staff', label: 'Staff', desc: 'Can record sales and track inventory counts.' },
                                    { val: 'manager', label: 'Manager', desc: 'Can manage products, reports and stock levels.' },
                                    { val: 'admin', label: 'Administrator', desc: 'Full access to system, users and factory reset.' }
                                ].map(r => (
                                    <TouchableOpacity
                                        key={r.val}
                                        style={[
                                            styles.radioItem,
                                            { borderColor: form.role === r.val ? theme.colors.primary : 'rgba(0,0,0,0.05)' },
                                            form.role === r.val && { backgroundColor: theme.colors.primaryContainer + '20' }
                                        ]}
                                        onPress={() => setForm({ ...form, role: r.val as any })}
                                    >
                                        <RadioButton value={r.val} />
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text variant="titleMedium" style={{ fontWeight: '900', color: form.role === r.val ? theme.colors.primary : '#1e293b' }}>{r.label}</Text>
                                            <Text variant="bodySmall" style={{ color: '#64748b' }}>{r.desc}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </RadioButton.Group>

                            {error ? (
                                <HelperText type="error" visible={!!error} style={{ marginTop: 12 }}>
                                    {error}
                                </HelperText>
                            ) : null}

                            <Button
                                mode="contained"
                                onPress={handleAddUser}
                                loading={loading}
                                disabled={loading || !form.username || !form.fullName || !form.password}
                                style={styles.button}
                                contentStyle={{ height: 56 }}
                                labelStyle={{ fontWeight: '900' }}
                                icon={() => <HugeiconsIcon icon={PlusSignIcon} size={20} color="#fff" />}
                            >
                                Create Staff Account
                            </Button>
                        </Card.Content>
                    </Card>
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
    card: {
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    sectionLabel: {
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1.5,
        fontSize: 10,
        marginBottom: 16,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 12,
    },
    button: {
        marginTop: 24,
        borderRadius: 18,
        backgroundColor: '#6366f1',
    },
});
