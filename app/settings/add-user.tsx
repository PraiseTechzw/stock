import { useUserManagement } from '@/src/hooks/useUserManagement';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, HelperText, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';

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

    const handleAddUser = async () => {
        if (!form.username || !form.fullName || !form.password) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await addUser(form.username, form.fullName, form.password, form.role);
            Alert.alert('Success', 'User added successfully');
            router.back();
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to add user. Username might already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Add New User' }} />

            <View style={styles.form}>
                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                    <Card.Content style={{ padding: 20 }}>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 24 }}>User Profile</Text>

                        <TextInput
                            label="Full Name *"
                            mode="outlined"
                            value={form.fullName}
                            onChangeText={(text) => setForm({ ...form, fullName: text })}
                            style={styles.input}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="Username *"
                            mode="outlined"
                            value={form.username}
                            onChangeText={(text) => setForm({ ...form, username: text })}
                            style={styles.input}
                            autoCapitalize="none"
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="Password *"
                            mode="outlined"
                            value={form.password}
                            onChangeText={(text) => setForm({ ...form, password: text })}
                            style={styles.input}
                            secureTextEntry
                            activeOutlineColor={theme.colors.primary}
                        />

                        <Divider style={{ marginVertical: 24 }} />

                        <Text variant="labelLarge" style={{ marginBottom: 16, fontWeight: 'bold', color: theme.colors.primary }}>ASSIGN ROLE</Text>
                        <RadioButton.Group
                            onValueChange={(value) => setForm({ ...form, role: value as any })}
                            value={form.role}
                        >
                            {[
                                { val: 'staff', label: 'Staff', desc: 'Sales & basic inventory tracking' },
                                { val: 'manager', label: 'Manager', desc: 'Inventory management & analytics' },
                                { val: 'admin', label: 'Administrator', desc: 'Full system access & user control' }
                            ].map(r => (
                                <View key={r.val} style={styles.radioItem}>
                                    <RadioButton value={r.val} />
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{r.label}</Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{r.desc}</Text>
                                    </View>
                                </View>
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
                        >
                            Create User Account
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
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    button: {
        marginTop: 24,
        borderRadius: 16,
    },
});
