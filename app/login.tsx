import { FadeView } from '@/src/components/ui/FadeView';
import { db } from '@/src/db/DatabaseProvider';
import { users } from '@/src/db/schema';
import { useAuth } from '@/src/hooks/useAuth';
import { useSystem } from '@/src/hooks/useSystem';
import {
    CircleLock02FreeIcons,
    CloudIcon,
    LeftToRightListDashIcon,
    UserIcon,
    ViewIcon,
    ViewOffIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {
    Button,
    HelperText,
    IconButton,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout,
    SlideInRight,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthStep = 'identify' | 'password' | 'register' | 'reconnect' | 'syncing';

export default function LoginScreen() {
    const theme = useTheme();
    const router = useRouter();
    const loginAuth = useAuth(state => state.login);

    const { importDatabase } = useSystem();
    const [step, setStep] = useState<AuthStep>('identify');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [foundUser, setFoundUser] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [isFreshSetup, setIsFreshSetup] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    const startCloudSync = () => {
        setStep('syncing');
        setSyncProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.05;
            setSyncProgress(progress);
            if (progress >= 1) {
                clearInterval(interval);
                setTimeout(() => {
                    Alert.alert(
                        "Workspace Found",
                        "We found a backup for '@" + username + "'. Would you like to restore it?",
                        [
                            { text: "Cancel", onPress: resetFlow, style: 'cancel' },
                            {
                                text: "Restore Data",
                                onPress: async () => {
                                    // Trigger the real import flow
                                    const success = await importDatabase();
                                    if (!success) {
                                        resetFlow();
                                    }
                                    // If success, importDatabase handles the reload.
                                }
                            }
                        ]
                    );
                }, 500);
            }
        }, 100);
    };

    const resetFlow = () => {
        setStep('identify');
        setFoundUser(null);
        setPassword('');
        setError('');
    };

    // Detect if this is a new device/fresh workspace
    useEffect(() => {
        const checkSystemState = async () => {
            try {
                const allUsers = await db.select().from(users);
                // System seeds an 'admin' user by default. If that's all there is, it's a fresh setup.
                if (allUsers.length <= 1) {
                    setIsFreshSetup(true);
                }
            } catch (e) {
                console.error('State check failed', e);
            }
        };
        checkSystemState();
    }, []);

    const checkUser = async () => {
        if (!username.trim()) {
            setError('Enter your username to continue');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const results = await db.select().from(users).where(eq(users.username, username.toLowerCase().trim()));
            if (results.length > 0) {
                setFoundUser(results[0]);
                setStep('password');
            } else {
                setStep('register');
            }
        } catch (e) {
            console.error(e);
            setError('System error. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const passwordHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                password
            );

            if (passwordHash === foundUser.passwordHash) {
                loginAuth({
                    id: foundUser.id,
                    username: foundUser.username,
                    fullName: foundUser.fullName,
                    role: foundUser.role as any,
                });
                router.replace('/(tabs)');
            } else {
                setError('Incorrect password');
            }
        } catch (e) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!fullName.trim() || !password) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const passwordHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                password
            );

            const newUser = await db.insert(users).values({
                username: username.toLowerCase().trim(),
                fullName: fullName.trim(),
                passwordHash,
                role: 'admin', // Default first user as admin
            }).returning();

            if (newUser.length > 0) {
                loginAuth({
                    id: newUser[0].id,
                    username: newUser[0].username,
                    fullName: newUser[0].fullName,
                    role: newUser[0].role as any,
                });
                router.replace('/(tabs)');
            }
        } catch (e) {
            setError('Could not create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[theme.colors.background, theme.colors.surfaceVariant]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <FadeView scale duration={800} style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
                            <Text variant="headlineMedium" style={styles.logoText}>S</Text>
                        </View>
                        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>STOCK</Text>
                        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                            {isFreshSetup ? 'New Device Detected' : 'Intelligence for your business'}
                        </Text>
                    </FadeView>

                    <Animated.View layout={Layout.springify()} style={styles.cardWrapper}>
                        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>

                            {/* Identify Step */}
                            {step === 'identify' && (
                                <Animated.View entering={FadeInDown.duration(400)}>
                                    <Text variant="titleLarge" style={styles.cardTitle}>Identity</Text>
                                    <Text variant="bodySmall" style={styles.cardSubtitle}>
                                        {isFreshSetup
                                            ? "New device detected. Enter a username to create your local profile."
                                            : "Enter username to sign in to this workspace."
                                        }
                                    </Text>

                                    <TextInput
                                        mode="outlined"
                                        placeholder="Username"
                                        value={username}
                                        onChangeText={(t) => { setUsername(t); setError(''); }}
                                        autoCapitalize="none"
                                        left={<TextInput.Icon icon={() => <HugeiconsIcon icon={UserIcon} size={20} color={theme.colors.primary} />} />}
                                        style={styles.input}
                                    />
                                    {error ? <HelperText type="error">{error}</HelperText> : null}

                                    <Button
                                        mode="contained"
                                        onPress={checkUser}
                                        loading={loading}
                                        style={styles.actionButton}
                                        contentStyle={styles.actionButtonContent}
                                    >
                                        Continue
                                    </Button>

                                    {isFreshSetup && (
                                        <TouchableOpacity
                                            onPress={() => setStep('reconnect')}
                                            style={styles.reconnectButton}
                                        >
                                            <HugeiconsIcon icon={CloudIcon} size={18} color={theme.colors.primary} />
                                            <Text variant="labelLarge" style={{ color: theme.colors.primary, marginLeft: 8 }}>Reconnect Workspace</Text>
                                        </TouchableOpacity>
                                    )}
                                </Animated.View>
                            )}

                            {/* Password Step (Existing User) */}
                            {step === 'password' && (
                                <Animated.View entering={SlideInRight.duration(400)}>
                                    <View style={styles.userRow}>
                                        <IconButton icon={() => <HugeiconsIcon icon={UserIcon} size={20} color={theme.colors.primary} />} style={styles.miniAvatar} />
                                        <View>
                                            <Text variant="titleMedium">Welcome back, {foundUser?.fullName || username}</Text>
                                            <Text variant="bodySmall" onPress={resetFlow} style={{ color: theme.colors.primary }}>Not you? Switch account</Text>
                                        </View>
                                    </View>

                                    <TextInput
                                        mode="outlined"
                                        placeholder="Enter password"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={(t) => { setPassword(t); setError(''); }}
                                        left={<TextInput.Icon icon={() => <HugeiconsIcon icon={CircleLock02FreeIcons} size={20} color={theme.colors.onSurfaceVariant} />} />}
                                        right={<TextInput.Icon icon={() => <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={20} onPress={() => setShowPassword(!showPassword)} />} />}
                                        style={styles.input}
                                    />
                                    {error ? <HelperText type="error">{error}</HelperText> : null}

                                    <Button
                                        mode="contained"
                                        onPress={handleLogin}
                                        loading={loading}
                                        style={styles.actionButton}
                                        contentStyle={styles.actionButtonContent}
                                    >
                                        Unlock
                                    </Button>
                                </Animated.View>
                            )}

                            {/* Register Step (New User) */}
                            {step === 'register' && (
                                <Animated.View entering={SlideInRight.duration(400)}>
                                    <Text variant="titleMedium">Setup Local Profile</Text>
                                    <Text variant="bodySmall" style={{ marginBottom: 16 }}>@{username} is ready for this device!</Text>

                                    <TextInput
                                        mode="outlined"
                                        label="Full Name"
                                        placeholder="Enter your name"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        style={styles.input}
                                    />

                                    <TextInput
                                        mode="outlined"
                                        label="Create Password"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        right={<TextInput.Icon icon={() => <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={20} onPress={() => setShowPassword(!showPassword)} />} />}
                                        style={styles.input}
                                    />

                                    {error ? <HelperText type="error">{error}</HelperText> : null}

                                    <View style={styles.row}>
                                        <Button mode="text" onPress={resetFlow} style={{ flex: 1 }}>Back</Button>
                                        <Button
                                            mode="contained"
                                            onPress={handleRegister}
                                            loading={loading}
                                            style={[styles.actionButton, { flex: 2, marginTop: 0 }]}
                                            contentStyle={styles.actionButtonContent}
                                        >
                                            Start Setup
                                        </Button>
                                    </View>
                                </Animated.View>
                            )}

                            {/* Reconnect Step */}
                            {step === 'reconnect' && (
                                <Animated.View entering={FadeInUp.duration(400)}>
                                    <View style={styles.reconnectHeader}>
                                        <HugeiconsIcon icon={CloudIcon} size={42} color={theme.colors.primary} />
                                        <Text variant="titleLarge" style={styles.reconnectTitle}>Workspace Sync</Text>
                                        <Text variant="bodySmall" style={styles.reconnectSubtitle}>
                                            Moving data to this device? Import your database or connect to your cloud backup.
                                        </Text>
                                    </View>

                                    <Button
                                        mode="outlined"
                                        icon={() => <HugeiconsIcon icon={LeftToRightListDashIcon} size={18} color={theme.colors.onSurface} />}
                                        onPress={importDatabase}
                                        style={styles.input}
                                    >
                                        Import db.sqlite
                                    </Button>

                                    <Button
                                        mode="contained-tonal"
                                        icon={() => <HugeiconsIcon icon={CloudIcon} size={18} color={theme.colors.primary} />}
                                        onPress={startCloudSync}
                                        style={styles.input}
                                    >
                                        Connect to Cloud
                                    </Button>

                                    <Button
                                        mode="text"
                                        onPress={resetFlow}
                                        style={{ marginTop: 8 }}
                                    >
                                        Back to local setup
                                    </Button>
                                </Animated.View>
                            )}

                            {/* Syncing Step */}
                            {step === 'syncing' && (
                                <Animated.View entering={FadeInDown.duration(400)} style={styles.syncContainer}>
                                    <HugeiconsIcon icon={CloudIcon} size={64} color={theme.colors.primary} />
                                    <Text variant="titleLarge" style={styles.syncTitle}>Syncing with Cloud...</Text>
                                    <Text variant="bodySmall" style={styles.syncSubtitle}>Searching for your business workspace backups</Text>

                                    <View style={styles.progressTrack}>
                                        <Animated.View
                                            style={[
                                                styles.progressBar,
                                                {
                                                    width: `${syncProgress * 100}%`,
                                                    backgroundColor: theme.colors.primary
                                                }
                                            ]}
                                        />
                                    </View>

                                    <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.5 }}>
                                        {Math.round(syncProgress * 100)}% Complete
                                    </Text>

                                    <Button
                                        mode="text"
                                        onPress={resetFlow}
                                        style={{ marginTop: 24 }}
                                    >
                                        Cancel Sync
                                    </Button>
                                </Animated.View>
                            )}
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.6 }}>
                            Offline First • SECURE ENCRYPTION
                        </Text>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
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
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logoText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 38,
    },
    title: {
        fontWeight: '900',
        letterSpacing: 4,
        fontSize: 28,
    },
    subtitle: {
        marginTop: 4,
        fontWeight: '500',
        opacity: 0.7,
    },
    cardWrapper: {
        width: '100%',
    },
    card: {
        borderRadius: 32,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardTitle: {
        fontWeight: '800',
        fontSize: 22,
    },
    cardSubtitle: {
        opacity: 0.6,
        marginBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    miniAvatar: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        margin: 0,
    },
    input: {
        marginBottom: 8,
        height: 56,
    },
    actionButton: {
        marginTop: 16,
        borderRadius: 16,
    },
    actionButtonContent: {
        height: 56,
    },
    reconnectButton: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 20,
    },
    reconnectHeader: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 16,
    },
    reconnectTitle: {
        fontWeight: '800',
        marginTop: 12,
    },
    reconnectSubtitle: {
        textAlign: 'center',
        opacity: 0.6,
        marginTop: 8,
        lineHeight: 18,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 16,
    },
    syncContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    syncTitle: {
        fontWeight: '900',
        marginTop: 20,
    },
    syncSubtitle: {
        opacity: 0.6,
        marginBottom: 32,
        textAlign: 'center',
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    }
});

