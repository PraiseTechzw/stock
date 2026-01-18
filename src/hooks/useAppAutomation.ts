import { and, eq, lt } from 'drizzle-orm';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { db } from '../db/DatabaseProvider';
import { notifications, salesOrders } from '../db/schema';
import { useSettingsStore } from '../store/useSettingsStore';
import { useReports } from './useReports';

export const useAppAutomation = () => {
    const { metrics } = useReports('all');
    const { notificationsEnabled } = useSettingsStore();

    useEffect(() => {
        if (!notificationsEnabled || !metrics) return;

        const checkCriticalAlerts = async () => {
            // 1. Check Low Stock
            if (metrics.lowStockCount > 0) {
                await triggerLocalNotification(
                    'Stock Alert',
                    `You have ${metrics.lowStockCount} items running low. Restock soon!`,
                    'low_stock'
                );
            }

            // 2. Check Overdue Debts
            try {
                const now = new Date().toISOString();
                const overdueSales = await db.select()
                    .from(salesOrders)
                    .where(and(
                        eq(salesOrders.paymentStatus, 'credit'),
                        lt(salesOrders.dueDate, now)
                    ));

                if (overdueSales.length > 0) {
                    await triggerLocalNotification(
                        'Overdue Payment',
                        `You have ${overdueSales.length} overdue payments to collect.`,
                        'debt'
                    );
                }
            } catch (error) {
                console.error('Error checking overdue debts:', error);
            }
        };

        checkCriticalAlerts();
    }, [metrics?.lowStockCount, notificationsEnabled]);

    const triggerLocalNotification = async (title: string, body: string, type: string) => {
        if (!notificationsEnabled) return;

        try {
            // Check if we already have a recent notification with same body to avoid spam
            const existing = await db.select()
                .from(notifications)
                .where(eq(notifications.body, body))
                .get();

            if (existing) {
                const createdDate = new Date(existing.created_at || '').toDateString();
                const today = new Date().toDateString();
                if (createdDate === today) return;
            }

            // 1. Show local notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: { type },
                },
                trigger: null,
            });

            // 2. Persist to DB
            await db.insert(notifications).values({
                title,
                body,
                type,
                isRead: false,
            });
        } catch (e) {
            console.error('Error triggering local notification:', e);
        }
    };
};
