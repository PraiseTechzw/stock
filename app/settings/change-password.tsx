import { useAuth } from '@/src/hooks/useAuth';
import { useUserManagement } from '@/src/hooks/useUserManagement';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput, useTheme } from 'react-native-paper';

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
            Alert.alert('Success', 'Password updated successfully');
            router.back();
        } catch (e: any) {
            console.error(e);
            setError('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Security' }} />

            <View style={styles.form}>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                    <Card.Content style={{ padding: 20 }}>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>Change Password</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
                            Enter your new password below. Ensure it is at least 6 characters long for security.
                        </Text>

                        <TextInput
                            label="New Password"
                            mode="outlined"
                            value={form.newPassword}
                            onChangeText={(text) => setForm({ ...form, newPassword: text })}
                            style={styles.input}
                            secureTextEntry
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="Confirm New Password"
                            mode="outlined"
                            value={form.confirmPassword}
                            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                            style={styles.input}
                            secureTextEntry
                            activeOutlineColor={theme.colors.primary}
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
                        >
                            Update Password
                        </Button>
                    </Card.Content>
                </Card>
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
    card: {
        elevation: 1,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: 24,
        borderRadius: 16,
    },
});
