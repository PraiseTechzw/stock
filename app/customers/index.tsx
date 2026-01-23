import { useCustomers } from '@/src/hooks/useCustomers';
import { ArrowLeft02Icon, PlusSignIcon, Search01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, FAB, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomersScreen() {
    const { customers, isLoading } = useCustomers();
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const theme = useTheme();

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.phone && c.phone.includes(searchQuery))
        );
    }, [customers, searchQuery]);

    const renderCustomer = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50)}>
            <Card
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                onPress={() => router.push(`/customers/${item.id}` as any)}
                elevation={0}
            >
                <Card.Title
                    title={item.name}
                    titleStyle={{ fontWeight: '900', color: '#1e293b', fontSize: 16 }}
                    subtitle={item.phone || item.email || 'No contact information'}
                    subtitleStyle={{ color: '#64748b', fontWeight: '600' }}
                    left={(props) => (
                        <Avatar.Text
                            size={44}
                            label={item.name.substring(0, 2).toUpperCase()}
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            color={theme.colors.primary}
                        />
                    )}
                />
            </Card>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Client Hub</Text>
                            <Text variant="bodyLarge" style={styles.userName}>Relationship Management</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Searchbar
                    placeholder="Search by name or phone..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.premiumSearch, { backgroundColor: theme.colors.surfaceVariant + '40' }]}
                    icon={() => <HugeiconsIcon icon={Search01Icon} size={20} color={theme.colors.primary} />}
                    inputStyle={{ fontSize: 15 }}
                    elevation={0}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCustomer}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Surface style={styles.emptyIconBg} elevation={0}>
                                <HugeiconsIcon icon={UserIcon} size={64} color={theme.colors.outlineVariant} />
                            </Surface>
                            <Text variant="headlineSmall" style={{ marginTop: 24, fontWeight: '900', color: theme.colors.onSurface }}>No clients found</Text>
                            <Text variant="bodyLarge" style={{ marginTop: 8, color: theme.colors.outline, textAlign: 'center' }}>
                                {customers.length === 0 ? "You haven't added any customers yet." : "No customers match your search."}
                            </Text>
                        </View>
                    }
                />
            )}

            <FAB
                animated
                icon={() => <HugeiconsIcon icon={PlusSignIcon} size={24} color="#fff" />}
                label="Add New Client"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#fff"
                onPress={() => router.push('/customers/add')}
            />
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
        marginBottom: 16,
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
    premiumSearch: {
        borderRadius: 16,
        height: 48,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 8,
    },
    card: {
        marginBottom: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        marginTop: 120,
        alignItems: 'center',
    },
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    fab: {
        position: 'absolute',
        margin: 24,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
});
