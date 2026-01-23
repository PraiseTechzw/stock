import { ArrowLeft02Icon, ArrowTurnBackwardIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReturnsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text variant="headlineSmall" style={styles.title}>Returns & Refunds</Text>
                        <Text variant="bodySmall" style={styles.subtitle}>Process product returns</Text>
                    </View>
                </View>
                <Searchbar
                    placeholder="Search order ID to return items..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    icon={() => <HugeiconsIcon icon={Search01Icon} size={20} color={theme.colors.onSurfaceVariant} />}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.emptyState}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.errorContainer }]}>
                        <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={48} color={theme.colors.error} />
                    </View>
                    <Text variant="headlineSmall" style={styles.emptyTitle}>Process a Return</Text>
                    <Text variant="bodyMedium" style={styles.emptySubtitle}>
                        Search for a past order to start a return or refund process.
                    </Text>
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
        marginBottom: 16,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerText: {
        marginLeft: 8,
    },
    title: {
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#64748b',
        marginTop: -2,
    },
    searchBar: {
        elevation: 0,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        height: 48,
    },
    content: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingBottom: 100,
    },
    iconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontWeight: '900',
        marginBottom: 8,
    },
    emptySubtitle: {
        textAlign: 'center',
        color: '#64748b',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
});
