import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/DatabaseProvider';
import { notifications } from '../db/schema';

export const useNotifications = () => {
    const { data: allNotifications } = useLiveQuery(
        db.select()
            .from(notifications)
            .orderBy(desc(notifications.created_at))
    );

    const addNotification = async (title: string, body: string, type: string = 'info', data?: any) => {
        try {
            await db.insert(notifications).values({
                title,
                body,
                type,
                data: data ? JSON.stringify(data) : null,
                isRead: false,
            });
        } catch (error) {
            // Error
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await db.update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.id, id));
        } catch (error) {
            // Error
        }
    };

    const markAllAsRead = async () => {
        try {
            await db.update(notifications)
                .set({ isRead: true });
        } catch (error) {
            // Error
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await db.delete(notifications).where(eq(notifications.id, id));
        } catch (error) {
            // Error
        }
    };

    const clearAll = async () => {
        try {
            await db.delete(notifications);
        } catch (error) {
            // Error
        }
    };

    const unreadCount = allNotifications?.filter(n => !n.isRead).length || 0;

    return {
        notifications: allNotifications || [],
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };
};
