'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Check, Package, CreditCard, Info } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    relatedOrderId: string | null;
    createdAt: string;
}

export default function NotificationsPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/sign-in');
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            loadNotifications();
        }
    }, [session]);

    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (res.ok) {
                await loadNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true }),
            });

            if (res.ok) {
                await loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order_update':
                return <Package className="h-5 w-5 text-blue-500" />;
            case 'subscription_update':
                return <CreditCard className="h-5 w-5 text-green-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    if (isPending || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500 dark:border-gray-700 dark:border-t-cyan-400" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30">
            <DashboardHeader
                userName={session.user.name || ''}
                userEmail={session.user.email || ''}
                userImage={session.user.image || null}
                onSignOut={async () => {
                    await authClient.signOut();
                    router.push('/sign-in');
                }}
                subscriptionTier={null}
                unreadNotificationCount={unreadCount}
            />

            <div className="mx-auto max-w-4xl px-6 py-12">
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <div className="mb-8 flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-4xl font-bold text-transparent">
                            Notifications
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </motion.div>
                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} variant="outline" size="sm">
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No notifications</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`cursor-pointer border-gray-200 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                                    !notification.isRead ? 'border-l-4 border-l-rose-500 bg-rose-50/50 dark:border-l-rose-400 dark:bg-rose-950/30' : ''
                                }`}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        markAsRead(notification.id);
                                    }
                                    if (notification.relatedOrderId) {
                                        router.push(`/dashboard/orders`);
                                    }
                                }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className={`font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

