import { Alert02Icon, ChartLineData01FreeIcons, Notification03Icon, PackageIcon, PlusSignIcon, ShoppingBag01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge, Button, Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';

import { Can } from '@/src/components/auth/Can';
import { AIInsights } from '@/src/components/ui/AIInsights';
import { AlertSection } from '@/src/components/ui/AlertSection';
import { MetricCard } from '@/src/components/ui/MetricCard';
import { SalesChart } from '@/src/components/ui/SalesChart';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';
import { ReportFilter, useReports } from '@/src/hooks/useReports';
import { useStock } from '@/src/hooks/useStock';
import { useSettingsStore } from '@/src/store/useSettingsStore';

export default function DashboardScreen() {
  const [filter, setFilter] = useState<ReportFilter>('all');
  const { lowStockProducts } = useStock();
  const { metrics, salesByCategory, recentActivities, isLoading } = useReports(filter);

  console.log('[Dashboard] recentActivities:', recentActivities.length);
  if (recentActivities.length > 0) {
    console.log('[Dashboard] First Activity:', JSON.stringify(recentActivities[0]));
  }
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { storeName } = useSettingsStore();
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="headlineMedium" style={[styles.greeting, { color: theme.colors.primary }]}>
              {storeName || 'Stock Hub'}
            </Text>
            <Text variant="bodyLarge" style={[styles.userName, { color: theme.colors.onSurfaceVariant }]}>
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

        <SectionHeader title="Recent Activity" />
        {recentActivities.length > 0 ? (
          <View style={[styles.activityList, { backgroundColor: theme.colors.surface, padding: 4 }]}>
            {recentActivities.map((activity: any, index: number) => {
              const isSale = activity.type === 'sale';
              const isExpense = activity.type === 'expense';
              const isProduct = activity.type === 'product';

              const bgColor = isSale ? '#ecfdf5' : isExpense ? '#fff1f2' : '#f5f3ff';
              const iconColor = isSale ? '#10b981' : isExpense ? '#f43f5e' : '#8b5cf6';

              return (
                <View key={activity.id}>
                  <TouchableOpacity
                    style={styles.customActivityRow}
                    onPress={() => {
                      if (isSale) router.push(`/sales/${activity.id.replace('sale-', '')}`);
                      if (isProduct) router.push('/(tabs)/inventory');
                    }}
                  >
                    <View style={[styles.activityIconBox, { backgroundColor: bgColor }]}>
                      <HugeiconsIcon
                        icon={activity.icon}
                        size={20}
                        color={iconColor}
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text variant="titleSmall" style={{ color: '#fff', fontWeight: 'bold' }}>
                        {activity.title || 'Activity'}
                      </Text>
                      <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                        {activity.subtitle || ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                        {activity.date instanceof Date ? activity.date.toLocaleDateString() : 'Now'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {index < recentActivities.length - 1 && <Divider style={{ opacity: 0.1, marginHorizontal: 16 }} />}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.colors.surface, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.outlineVariant }]}>
            <Text variant="bodyMedium" style={[styles.emptyActivity, { color: theme.colors.onSurfaceVariant }]}>No recent activity found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  greeting: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  filterButtons: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  userName: {
    marginTop: -4,
  },
  avatarContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notifBtn: {
    padding: 4,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  placeholder: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emptyActivity: {
    textAlign: 'center',
  },
  activityList: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 1,
    marginBottom: 40,
  },
  activityItem: {
    paddingVertical: 12,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginRight: 8,
  },
  activityTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  activityDate: {
    opacity: 0.5,
    marginRight: 12,
    alignSelf: 'center',
  },
  customActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
