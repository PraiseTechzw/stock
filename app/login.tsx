import { db } from '@/src/db/DatabaseProvider';
import { users } from '@/src/db/schema';
import { useAuth } from '@/src/hooks/useAuth';
import { ArrowDown01Icon, CircleLock02FreeIcons, LockIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Menu, Text, TextInput, useTheme } from 'react-native-paper';

export default function LoginScreen() {
    const theme = useTheme();
    const router = useRouter();
    const login = useAuth(state => state.login);

    const { data: userList } = useLiveQuery(db.select().from(users));

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogin = async () => {
        if (!selectedUser) {
            setError('Please select a user');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setLoggingIn(true);
        setError('');

        try {
            const passwordHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                password
            );

            if (passwordHash === selectedUser.passwordHash) {
                login({
                    id: selectedUser.id,
                    username: selectedUser.username,
                    fullName: selectedUser.fullName,
                    role: selectedUser.role as any,
                });
                router.replace('/(tabs)');
            } else {
                setError('Incorrect password');
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred during login');
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
                        <Text variant="headlineMedium" style={styles.logoText}>S</Text>
                    </View>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>STOCK</Text>
                    <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Inventory & Sales Management</Text>
                </View>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleLarge" style={[styles.loginTitle, { color: theme.colors.onSurface }]}>Welcome Back</Text>

                        <View style={styles.inputGroup}>
                            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Select User</Text>
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        onPress={() => setMenuVisible(true)}
                                        style={[styles.dropdownButton, { borderColor: theme.colors.outline }]}
                                        contentStyle={styles.dropdownContent}
                                        labelStyle={{ color: theme.colors.onSurface }}
                                        icon={() => <HugeiconsIcon icon={ArrowDown01Icon} size={20} color={theme.colors.onSurfaceVariant} />}
                                    >
                                        {selectedUser ? selectedUser.fullName || selectedUser.username : 'Choose a profile'}
                                    </Button>
                                }
                                style={[styles.menu, { backgroundColor: theme.colors.surfaceVariant }]}
                            >
                                {userList?.map((u: any) => (
                                    <Menu.Item
                                        key={u.id}
                                        onPress={() => {
                                            setSelectedUser(u);
                                            setMenuVisible(false);
                                            setError('');
                                        }}
                                        title={u.fullName || u.username}
                                        titleStyle={{ color: theme.colors.onSurface }}
                                        leadingIcon={() => <HugeiconsIcon icon={UserIcon} size={20} color={theme.colors.primary} />}
                                    />
                                ))}
                            </Menu>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Password</Text>
                            <TextInput
                                mode="outlined"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setError('');
                                }}
                                secureTextEntry
                                placeholder="Enter password"
                                left={<TextInput.Icon icon={() => <HugeiconsIcon icon={CircleLock02FreeIcons} size={20} color={theme.colors.onSurfaceVariant} />} />}
                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.primary}
                                textColor={theme.colors.onSurface}
                                autoCapitalize="none"
                            />
                            {error ? (
                                <HelperText type="error" visible={!!error}>
                                    {error}
                                </HelperText>
                            ) : null}
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            loading={loggingIn}
                            disabled={loggingIn || !selectedUser}
                            contentStyle={styles.loginButtonContent}
                        >
                            Sign In
                        </Button>
                    </Card.Content>
                </Card>

                <Text variant="bodySmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
                    Offline Local Database
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    logoText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 32,
    },
    title: {
        fontWeight: '900',
        letterSpacing: 2,
    },
    subtitle: {
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        elevation: 4,
        borderRadius: 24,
        paddingVertical: 12,
    },
    loginTitle: {
        marginBottom: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: 11,
    },
    dropdownButton: {
        borderRadius: 12,
        height: 54,
        justifyContent: 'center',
    },
    dropdownContent: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
    input: {
        height: 54,
    },
    loginButton: {
        marginTop: 12,
        borderRadius: 14,
        elevation: 4,
    },
    loginButtonContent: {
        height: 54,
    },
    menu: {
        width: '100%',
        marginTop: 54,
    },
    footer: {
        textAlign: 'center',
        marginTop: 48,
        opacity: 0.5,
        fontWeight: '500',
    }
});
