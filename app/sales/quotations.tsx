import { ArrowLeft02Icon, LicenseIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuotationsScreen() {
    const router = useRouter();
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text variant="headlineSmall" style={styles.title}>Quotations</Text>
                        <Text variant="bodySmall" style={styles.subtitle}>Draft estimates for customers</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.emptyState}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer }]}>
                        <HugeiconsIcon icon={LicenseIcon} size={48} color={theme.colors.primary} />
                    </View>
                    <Text variant="headlineSmall" style={styles.emptyTitle}>No Quotations</Text>
                    <Text variant="bodyMedium" style={styles.emptySubtitle}>
                        Create professional quotations and send them to your customers before they buy.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => router.push('/sales/create')}
                        style={styles.actionBtn}
                        icon={() => <HugeiconsIcon icon={PlusSignIcon} size={20} color="#fff" />}
                    >
                        New Quotation
                    </Button>
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
    actionBtn: {
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        justifyContent: 'center',
    },
});
