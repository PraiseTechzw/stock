import { useStock } from '@/src/hooks/useStock';
import { Alert01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LowStockScreen() {
    const { lowStockProducts } = useStock();
    const router = useRouter();
    const theme = useTheme();

    const renderProduct = ({ item }: { item: any }) => (
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.error }]}
            onPress={() => router.push(`/inventory/${item.id}`)}
            elevation={1}
        >
            <Card.Title
                title={item.name}
                titleStyle={{ fontWeight: 'bold' }}
                subtitle={`SKU: ${item.sku} | Min Alert Level: ${item.minStockLevel}`}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                left={(props) => (
                    <Avatar.Icon
                        {...props}
                        icon="alert-octagon"
                        color={theme.colors.error}
                        style={{ backgroundColor: theme.colors.errorContainer }}
                    />
                )}
            />
            <Card.Content>
                <View style={styles.alertIndicator}>
                    <Text variant="labelLarge" style={{ color: theme.colors.error, fontWeight: '900' }}>
                        STOCK CRITICAL
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Items require immediate restock
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerTitleGroup}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="headlineMedium" style={styles.greeting}>Critical Alerts</Text>
                            <Text variant="bodyLarge" style={styles.userName}>{lowStockProducts.length} items low on stock</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={lowStockProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProduct}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={styles.successCircle}>
                            <HugeiconsIcon icon={Alert01Icon} size={48} color={theme.colors.primary} />
                        </View>
                        <Text variant="headlineSmall" style={[styles.emptyText, { color: theme.colors.onSurface }]}>All Levels Stable</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                            Great! No items are currently below their minimum threshold.
                        </Text>
                    </View>
                }
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
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        marginBottom: 16,
        borderRadius: 24,
        borderLeftWidth: 6,
    },
    alertIndicator: {
        marginTop: 4,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontWeight: '900',
        letterSpacing: -0.5,
    },
});
