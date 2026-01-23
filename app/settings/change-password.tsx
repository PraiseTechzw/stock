import { useAuth } from '@/src/hooks/useAuth';
import { useUserManagement } from '@/src/hooks/useUserManagement';
import { ArrowLeft02Icon, CheckmarkCircle01Icon, Shield01Icon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ChangePasswordScreen() {
    const { user } = useAuth();
    const { updatePassword } = useUserManagement();
    const router = useRouter();
    const theme = useTheme();

    const [form, setForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secureText, setSecureText] = useState(true);

    const handleChangePassword = async () => {
        if (!form.newPassword || !form.confirmPassword) {
            setError('Both fields are required');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!user) return;

        setLoading(true);
        setError('');

        try {
            await updatePassword(user.id, form.newPassword);
            Toast.show({
                type: 'success',
                text1: 'Security Updated',
                text2: 'Your password has been changed successfully.',
            });
            router.back();
        } catch (e: any) {
            console.error(e);
            setError('Failed to update password');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not update your password.',
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
                            <Text variant="headlineMedium" style={styles.greeting}>Security</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Update your credentials</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={0}>
                        <Card.Content style={{ padding: 24 }}>
                            <View style={styles.iconCircle}>
                                <HugeiconsIcon icon={Shield01Icon} size={40} color={theme.colors.primary} />
                            </View>

                            <Text variant="headlineSmall" style={{ fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>Protect your account</Text>
                            <Text variant="bodyMedium" style={{ color: '#64748b', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 }}>
                                Set a strong password to keep your business data and staff information secure.
                            </Text>

                            <TextInput
                                label="New Password"
                                mode="outlined"
                                value={form.newPassword}
                                onChangeText={(text) => setForm({ ...form, newPassword: text })}
                                style={styles.input}
                                secureTextEntry={secureText}
                                activeOutlineColor={theme.colors.primary}
                                outlineStyle={{ borderRadius: 16 }}
                                left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Shield01Icon} size={20} color={theme.colors.outline} />} />}
                                right={<TextInput.Icon icon={() => <HugeiconsIcon icon={secureText ? ViewIcon : ViewOffSlashIcon} size={20} color={theme.colors.outline} />} onPress={() => setSecureText(!secureText)} />}
                            />
                            <TextInput
                                label="Confirm New Password"
                                mode="outlined"
                                value={form.confirmPassword}
                                onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                                style={styles.input}
                                secureTextEntry={secureText}
                                activeOutlineColor={theme.colors.primary}
                                outlineStyle={{ borderRadius: 16 }}
                                left={<TextInput.Icon icon={() => <HugeiconsIcon icon={Shield01Icon} size={20} color={theme.colors.outline} />} />}
                            />

                            {error ? (
                                <HelperText type="error" visible={!!error} style={{ marginTop: 8 }}>
                                    {error}
                                </HelperText>
                            ) : null}

                            <Button
                                mode="contained"
                                onPress={handleChangePassword}
                                loading={loading}
                                disabled={loading || !form.newPassword || !form.confirmPassword}
                                style={styles.button}
                                contentStyle={{ height: 56 }}
                                labelStyle={{ fontWeight: '900' }}
                                icon={() => <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#fff" />}
                            >
                                Save New Password
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
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
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
});
