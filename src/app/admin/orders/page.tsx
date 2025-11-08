'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
    };
}

interface Order {
    id: string;
    userId: string;
    totalAmount: string;
    currency: string;
    status: string;
    trackingNumber: string | null;
    notes: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    items: OrderItem[];
    shippingAddress: any;
}

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ status?: string; trackingNumber?: string; notes?: string }>({});

    useEffect(() => {
        if (session?.user?.id) {
            checkAdminAndLoad();
        }
    }, [session]);

    const checkAdminAndLoad = async () => {
        try {
            const statsRes = await fetch('/api/admin/stats');
            if (statsRes.status === 403) {
                setIsAdmin(false);
                router.push('/dashboard');
                toast.error('Access Denied');
                return;
            }

            if (statsRes.ok) {
                setIsAdmin(true);
                loadOrders();
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Error loading admin data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        }
    };

    const handleEdit = (order: Order) => {
        setEditingOrder(order.id);
        setEditForm({
            status: order.status,
            trackingNumber: order.trackingNumber || '',
            notes: order.notes || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingOrder(null);
        setEditForm({});
    };

    const handleSaveEdit = async (orderId: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    ...editForm,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update order');
            }

            toast.success('Order updated successfully');
            setEditingOrder(null);
            setEditForm({});
            await loadOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'shipped':
                return <Truck className="h-5 w-5 text-blue-500" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    if (isPending || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500 dark:border-gray-700 dark:border-t-cyan-400" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin Dashboard
                </Button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-4xl font-bold text-transparent dark:from-rose-400 dark:via-pink-400 dark:to-rose-500">
                        Order Management
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Manage customer orders and track shipments</p>
                </motion.div>

                {orders.length === 0 ? (
                    <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No orders yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                                Order #{order.id.slice(0, 8)}
                                            </CardTitle>
                                            <CardDescription className="dark:text-gray-400">
                                                Customer: {order.user.name} ({order.user.email})
                                                <br />
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingOrder === order.id ? (
                                                <>
                                                    <Button onClick={() => handleSaveEdit(order.id)} size="sm" variant="default">
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save
                                                    </Button>
                                                    <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                                        <X className="mr-2 h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="capitalize">{order.status}</span>
                                                    </div>
                                                    <Button onClick={() => handleEdit(order)} size="sm" variant="outline">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {editingOrder === order.id ? (
                                        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                                <select
                                                    value={editForm.status || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                                >
                                                    {ORDER_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                                                <input
                                                    type="text"
                                                    value={editForm.trackingNumber || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                                                    placeholder="Enter tracking number"
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                                <textarea
                                                    value={editForm.notes || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                    placeholder="Add order notes"
                                                    rows={3}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                                        <div className="flex items-center gap-3">
                                                            {item.product.imageUrl && (
                                                                <img
                                                                    src={item.product.imageUrl}
                                                                    alt={item.product.name}
                                                                    className="h-16 w-16 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                            ${parseFloat(item.totalPrice).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                        ${parseFloat(order.totalAmount).toFixed(2)} {order.currency.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>

                                            {order.trackingNumber && (
                                                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/50">
                                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Tracking Number</p>
                                                    <p className="text-sm text-blue-700 dark:text-blue-400">{order.trackingNumber}</p>
                                                </div>
                                            )}

                                            {order.notes && (
                                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Order Notes</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{order.notes}</p>
                                                </div>
                                            )}

                                            {order.shippingAddress && (
                                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Shipping Address</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {order.shippingAddress.addressLine1}
                                                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                        <br />
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                                        <br />
                                                        {order.shippingAddress.country}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

