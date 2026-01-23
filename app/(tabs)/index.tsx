import { Alert02Icon, ChartLineData01FreeIcons, PackageIcon, PlusSignIcon, ShoppingBag01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Can } from '@/src/components/auth/Can';
import { AIInsights } from '@/src/components/ui/AIInsights';
import { AlertSection } from '@/src/components/ui/AlertSection';
import { MainHeader } from '@/src/components/ui/MainHeader';
import { MetricCard } from '@/src/components/ui/MetricCard';
import { SalesChart } from '@/src/components/ui/SalesChart';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { ReportFilter, useReports } from '@/src/hooks/useReports';
import { useStock } from '@/src/hooks/useStock';

export default function DashboardScreen() {
  const [filter, setFilter] = useState<ReportFilter>('all');
  const { lowStockProducts } = useStock();
  const { metrics, salesByCategory, recentActivities, isLoading } = useReports(filter);

  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <MainHeader showStoreName showGreeting />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

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

          <View style={styles.metricsRow}>
            <MetricCard
              title="Inventory"
              label="Total Products"
              value={metrics?.totalProducts || 0}
              icon={PackageIcon}
              style={{ marginRight: 8, flex: 1 }}
            />
            <Can perform="view-reports">
              <MetricCard
                title="Revenue"
                label="Total Revenue"
                value={`$${metrics?.totalRevenue?.toLocaleString() || 0}`}
                icon={ChartLineData01FreeIcons}
                style={{ marginLeft: 8, flex: 1 }}
              />
            </Can>
          </View>

          {metrics && metrics.totalDebts > 0 && (
            <MetricCard
              title="IOUs"
              label="Uncollected Debts"
              value={`$${metrics.totalDebts.toLocaleString()}`}
              icon={Wallet01Icon}
              color={theme.colors.error}
              style={{ marginBottom: 20 }}
              onPress={() => router.push('/(tabs)/financials')}
            />
          )}

          <Can perform="view-reports">
            <SalesChart
              title="Sales Performance"
              data={salesByCategory}
            />
            <AIInsights metrics={metrics} />
          </Can>

          {metrics && metrics.lowStockCount > 0 && (
            <AlertSection
              title={`${metrics?.lowStockCount} Low Stock Alerts`}
              description="Some items are running low. Action required."
              icon={Alert02Icon}
              actionLabel="View"
              onAction={() => router.push('/inventory/low-stock')}
            />
          )}

          <SectionHeader title="Quick Actions" />
          <View style={styles.actions}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => router.push('/inventory/add')}
              icon={() => <HugeiconsIcon icon={PlusSignIcon} size={20} color={theme.colors.onPrimary} />}
              contentStyle={{ height: 48 }}
            >
              Product
            </Button>
            <Button
              mode="contained-tonal"
              style={styles.actionButton}
              onPress={() => router.push('/sales/create')}
              icon={() => <HugeiconsIcon icon={ShoppingBag01Icon} size={20} color={theme.colors.primary} />}
              contentStyle={{ height: 48 }}
            >
              Quick Sale
            </Button>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  filterButtons: {
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
  },
});
