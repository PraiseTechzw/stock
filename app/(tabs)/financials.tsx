import { useAuth } from '@/src/hooks/useAuth';
import { useExpenses } from '@/src/hooks/useExpenses';
import { useNotifications } from '@/src/hooks/useNotifications';
import { ReportFilter, useReports } from '@/src/hooks/useReports';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { isAfter, parseISO, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Badge, Card, FAB, IconButton, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { Delete02Icon, Notification03Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

export default function FinancialsScreen() {
    const [filter, setFilter] = useState<ReportFilter>('all');
    const { expenses, isLoading: expensesLoading, deleteExpense } = useExpenses();
    const { metrics, isLoading: reportsLoading } = useReports(filter);
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const { storeName } = useSettingsStore();
    const router = useRouter();
    const theme = useTheme();

    const getFilterDate = (range: ReportFilter) => {
        const now = new Date();
        switch (range) {
            case 'today': return startOfDay(now);
            case 'week': return startOfWeek(now);
            case 'month': return startOfMonth(now);
            case 'year': return startOfYear(now);
            default: return null;
        }
    };

    const filteredExpenses = useMemo(() => {
        if (filter === 'all') return expenses;
        const filterDate = getFilterDate(filter);
        return expenses.filter(e => {
            const date = parseISO(e.date);
            return isAfter(date, filterDate!);
        });
    }, [expenses, filter]);

    const handleExportPL = async () => {
        if (!metrics) return;

        const html = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica'; padding: 20px; color: #333; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .title { font-size: 24px; font-weight: bold; }
                        .subtitle { font-size: 14px; color: #666; }
                        .section { margin-bottom: 20px; }
                        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .label { font-weight: 500; }
                        .value { font-weight: bold; }
                        .total-row { border-top: 2px solid #333; margin-top: 10px; padding-top: 15px; }
                        .profit { color: #10b981; }
                        .loss { color: #ef4444; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">Profit & Loss Statement</div>
                        <div class="subtitle">Generated on ${new Date().toLocaleDateString()} | Range: ${filter.toUpperCase()}</div>
                    </div>

                    <div class="section">
                        <div class="row">
                            <span class="label">Total Revenue</span>
                            <span class="value">$${metrics.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div class="row">
                            <span class="label">Cost of Goods Sold (COGS)</span>
                            <span class="value">-$${metrics.cogs.toFixed(2)}</span>
                        </div>
                        <div class="row total-row">
                            <span class="label">Gross Profit</span>
                            <span class="value profit"> $${metrics.grossProfit.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="row">
                            <span class="label">Operating Expenses</span>
                            <span class="value">-$${metrics.totalExpenses.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="row total-row">
                            <span class="label">Net Profit</span>
                            <span class="value ${metrics.netProfit >= 0 ? 'profit' : 'loss'}">$${metrics.netProfit.toFixed(2)}</span>
                        </div>
                        <div class="row">
                            <span class="label">Profit Margin</span>
                            <span class="value">${metrics.margin.toFixed(1)}%</span>
                        </div>
                    </div>
                </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF report.');
        }
    };

    const handleDeleteExpense = (id: number) => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense record?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
            ]
        );
    };

    const renderExpense = (item: any) => (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} key={item.id}>
            <Card.Title
                title={item.category || 'General'}
                titleStyle={{ fontWeight: 'bold' }}
                subtitle={item.description || 'No description'}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                right={(props) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text variant="titleMedium" style={{ marginRight: 0, fontWeight: 'bold', color: theme.colors.error }}>
                            -${item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        <IconButton
                            {...props}
                            icon={() => <HugeiconsIcon icon={Delete02Icon} size={20} color={theme.colors.onSurfaceVariant} />}
                            onPress={() => handleDeleteExpense(item.id)}
                        />
                    </View>
                )}
                left={(props) => (
                    <Avatar.Icon
                        {...props}
                        icon="cash-minus"
                        size={40}
                        style={{ backgroundColor: theme.colors.errorContainer }}
                        color={theme.colors.error}
                    />
                )}
            />
            <Card.Content>
                <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                    {new Date(item.date || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <View>
                        <Text variant="headlineMedium" style={styles.greeting}>
                            {storeName || 'Stock Hub'}
                        </Text>
                        <Text variant="bodyLarge" style={styles.userName}>
                            {user?.fullName || user?.username}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => router.push('/notifications')}
                            style={styles.notifBtn}
                        >
                            <HugeiconsIcon icon={Notification03Icon} size={28} color={theme.colors.onSurface} />
                            {unreadCount > 0 && (
                                <Badge
                                    style={styles.notifBadge}
                                    size={16}
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </TouchableOpacity>
                        <View style={styles.avatarContainer}>
                            <Avatar.Text
                                size={40}
                                label={user?.username?.substring(0, 2).toUpperCase() || 'U'}
                                style={{ backgroundColor: theme.colors.primaryContainer }}
                                color={theme.colors.primary}
                            />
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <SegmentedButtons
                    value={filter}
                    onValueChange={(v) => setFilter(v as ReportFilter)}
                    buttons={[
                        { value: 'all', label: 'All' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'Week' },
                        { value: 'month', label: 'Month' },
                    ]}
                    style={styles.filterButtons}
                />

                <SectionHeader
                    title="Financial Summary"
                    actionLabel="Download PL"
                    onAction={handleExportPL}
                />

                <Card style={[styles.plCard, { backgroundColor: theme.colors.primary, borderRadius: 24 }]}>
                    <Card.Content style={{ padding: 20 }}>
                        <View style={styles.netProfitRow}>
                            <View>
                                <Text variant="titleMedium" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>Net Profit</Text>
                                <Text variant="displaySmall" style={{ color: '#fff', fontWeight: '900', letterSpacing: -1 }}>
                                    ${metrics?.netProfit?.toLocaleString() || '0.00'}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Text variant="labelLarge" style={{ color: '#fff', fontWeight: 'bold' }}>
                                    {metrics?.margin?.toFixed(1) || 0}% Margin
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.metricsGrid, { marginTop: 24, backgroundColor: 'rgba(0,0,0,0.1)', padding: 16, borderRadius: 16 }]}>
                            <View style={styles.metricItem}>
                                <Text variant="labelSmall" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Revenue</Text>
                                <Text variant="titleMedium" style={{ color: '#fff', fontWeight: 'bold' }}>${metrics?.totalRevenue?.toLocaleString() || '0'}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text variant="labelSmall" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Expenses</Text>
                                <Text variant="titleMedium" style={{ color: '#fff', fontWeight: 'bold' }}>${metrics?.totalExpenses?.toLocaleString() || '0'}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <SectionHeader
                    title="Financial Health"
                    actionLabel="IOU List"
                    onAction={() => { }}
                />

                {metrics && (
                    <Card style={[styles.debtCard, { borderLeftColor: theme.colors.error }]}>
                        <Card.Content>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: '900' }}>TOTAL OUTSTANDING DEBT</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text variant="headlineMedium" style={{ fontWeight: '900', color: theme.colors.error }}>
                                            ${metrics?.totalDebts?.toLocaleString() || '0.00'}
                                        </Text>
                                        <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.outline }}>from customers (IOUs)</Text>
                                    </View>
                                </View>
                                <View style={[styles.iconIndicator, { backgroundColor: theme.colors.errorContainer }]}>
                                    <HugeiconsIcon icon={Wallet01Icon} size={24} color={theme.colors.error} />
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                <SectionHeader
                    title="Expense Logs"
                />

                {reportsLoading || expensesLoading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <>
                        {filteredExpenses.sort((a, b) => b.id - a.id).map(e => renderExpense(e))}
                        {filteredExpenses.length === 0 && (
                            <View style={styles.empty}>
                                <HugeiconsIcon icon={Wallet01Icon} size={64} color={theme.colors.outlineVariant} />
                                <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No records for this period</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <FAB
                icon="plus"
                label="New Expense"
                style={styles.fab}
                onPress={() => router.push('/financials/add')}
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
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notifBtn: {
        position: 'relative',
        padding: 4,
    },
    notifBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        fontWeight: 'bold',
        backgroundColor: '#ef4444',
    },
    avatarContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        padding: 20,
    },
    filterButtons: {
        marginBottom: 24,
    },
    card: {
        marginBottom: 12,
        borderRadius: 16,
        elevation: 1,
    },
    plCard: {
        marginBottom: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    debtCard: {
        marginBottom: 12,
        borderRadius: 16,
        elevation: 2,
        borderLeftWidth: 6,
        backgroundColor: '#fff',
    },
    iconIndicator: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
    },
    netProfitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dateText: {
        marginTop: -4,
        fontWeight: '500',
    },
    empty: {
        marginTop: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 24,
        right: 0,
        bottom: 0,
        borderRadius: 16,
        backgroundColor: '#6366f1',
    },
    centered: {
        paddingVertical: 40,
        alignItems: 'center',
    }
});
