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
            console.error('Error adding notification:', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await db.update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.id, id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await db.update(notifications)
                .set({ isRead: true });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await db.delete(notifications).where(eq(notifications.id, id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAll = async () => {
        try {
            await db.delete(notifications);
        } catch (error) {
            console.error('Error clearing notifications:', error);
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
