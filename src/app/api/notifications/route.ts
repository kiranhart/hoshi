import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/db';
import { notification } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await db
            .select()
            .from(notification)
            .where(eq(notification.userId, session.user.id))
            .orderBy(desc(notification.createdAt));

        const unreadCount = notifications.filter(n => !n.isRead).length;

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await markAllNotificationsAsRead(session.user.id);
            return NextResponse.json({ success: true });
        }

        if (notificationId) {
            await markNotificationAsRead(notificationId, session.user.id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

