'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    currency: string;
    imageUrl: string | null;
    stripePriceId: string | null;
}

export default function ShopPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/sign-in');
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            loadProducts();
            loadNotificationCount();
        }
    }, [session]);

    const loadNotificationCount = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setUnreadNotificationCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notification count:', error);
        }
    };

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
                // Initialize quantities
                const initialQuantities: Record<string, number> = {};
                data.products?.forEach((p: Product) => {
                    initialQuantities[p.id] = 1;
                });
                setQuantities(initialQuantities);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (productId: string, delta: number) => {
        setQuantities((prev) => {
            const newQty = (prev[productId] || 1) + delta;
            return { ...prev, [productId]: Math.max(1, newQty) };
        });
    };

    const handleCheckout = async (productId: string) => {
        const quantity = quantities[productId] || 1;
        setIsCheckingOut(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'product',
                    productId,
                    quantity,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            toast.error('Failed to start checkout');
        } finally {
            setIsCheckingOut(false);
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
                unreadNotificationCount={unreadNotificationCount}
            />

            <div className="mx-auto max-w-7xl px-6 py-12">
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-4xl font-bold text-transparent">
                        Shop
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Order QR code stickers, wallet cards, and more</p>
                </motion.div>

                {products.length === 0 ? (
                    <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ShoppingCart className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No products available</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back soon for new products!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Card key={product.id} className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                {product.imageUrl && (
                                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle>{product.name}</CardTitle>
                                    {product.description && <CardDescription>{product.description}</CardDescription>}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            ${parseFloat(product.price).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleQuantityChange(product.id, -1)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="flex-1 text-center font-medium">{quantities[product.id] || 1}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleQuantityChange(product.id, 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={() => handleCheckout(product.id)}
                                        disabled={isCheckingOut}
                                        className="w-full"
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {isCheckingOut ? 'Processing...' : 'Add to Cart'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

