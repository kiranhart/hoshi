import db from '@/db';
import { notification } from '@/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export async function createNotification(
    userId: string,
    type: 'order_update' | 'subscription_update' | 'system',
    title: string,
    message: string,
    relatedOrderId?: string
) {
    const id = randomUUID();
    await db.insert(notification).values({
        id,
        userId,
        type,
        title,
        message,
        relatedOrderId: relatedOrderId || null,
        isRead: false,
    });
    return id;
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
    await db
        .update(notification)
        .set({ isRead: true })
        .where(eq(notification.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: string) {
    await db
        .update(notification)
        .set({ isRead: true })
        .where(eq(notification.userId, userId));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
        .select()
        .from(notification)
        .where(eq(notification.userId, userId));
    
    return result.filter(n => !n.isRead).length;
}

