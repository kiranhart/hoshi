'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Building2, CreditCard, MapPin, Save, Sparkles, Star, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { type AddressData, AddressForm } from '@/components/dashboard/AddressForm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfilePictureUpload } from '@/components/dashboard/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/constants';

interface Subscription {
    id: string;
    tier: string;
    status: string;
    billingPeriod: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
}

export default function AccountSettingsPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');
    const [addressId, setAddressId] = useState<string | null>(null);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Address form state
    const [address, setAddress] = useState<AddressData>({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
    });

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/sign-in');
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setProfileImage(session?.user?.image || null);

            // Load subscription
            const subRes = await fetch('/api/stripe/subscription');
            if (subRes.ok) {
                const subData = await subRes.json();
                if (subData.subscription) {
                    setSubscription(subData.subscription);
                    setSubscriptionTier(subData.subscription.tier as SubscriptionTier);
                }
            }

            // Load address
            const addrRes = await fetch('/api/address');
            if (addrRes.ok) {
                const addrData = await addrRes.json();
                if (addrData.addresses && addrData.addresses.length > 0) {
                    const defaultAddr = addrData.addresses.find((a: any) => a.isDefault) || addrData.addresses[0];
                    setAddress({
                        addressLine1: defaultAddr.addressLine1 || '',
                        addressLine2: defaultAddr.addressLine2 || '',
                        city: defaultAddr.city || '',
                        state: defaultAddr.state || '',
                        postalCode: defaultAddr.postalCode || '',
                        country: defaultAddr.country || 'United States',
                    });
                    setAddressId(defaultAddr.id);
                }
            }

            // Load notification count
            const notifRes = await fetch('/api/notifications');
            if (notifRes.ok) {
                const notifData = await notifRes.json();
                setUnreadNotificationCount(notifData.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            router.push('/sign-in');
        } catch (error) {
            console.error('Sign out error:', error);
            toast.error('Failed to sign out');
        }
    };

    const handleAddressSave = async () => {
        setIsSaving(true);
        try {
            if (addressId) {
                // Update existing address
                const res = await fetch('/api/address', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        addressId,
                        ...address,
                        isDefault: true,
                    }),
                });
                if (!res.ok) throw new Error('Failed to update address');
            } else {
                // Create new address
                const res = await fetch('/api/address', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...address,
                        isDefault: true,
                    }),
                });
                if (!res.ok) throw new Error('Failed to create address');
                const data = await res.json();
                setAddressId(data.addressId);
            }
            toast.success('Address saved successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgrade = async (tier: 'basic' | 'pro' | 'premium') => {
        setIsLoadingSubscription(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'subscription',
                    tier,
                    period: selectedPeriod,
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
            setIsLoadingSubscription(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
            return;
        }

        setIsLoadingSubscription(true);
        try {
            const res = await fetch('/api/stripe/subscription', {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to cancel subscription');
            }

            toast.success('Subscription will be canceled at the end of the billing period');
            await loadData();
        } catch (error) {
            console.error('Error canceling subscription:', error);
            toast.error('Failed to cancel subscription');
        } finally {
            setIsLoadingSubscription(false);
        }
    };

    const handleResumeSubscription = async () => {
        setIsLoadingSubscription(true);
        try {
            const res = await fetch('/api/stripe/subscription', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resume' }),
            });

            if (!res.ok) {
                throw new Error('Failed to resume subscription');
            }

            toast.success('Subscription resumed');
            await loadData();
        } catch (error) {
            console.error('Error resuming subscription:', error);
            toast.error('Failed to resume subscription');
        } finally {
            setIsLoadingSubscription(false);
        }
    };

    if (isPending || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500 dark:border-gray-700 dark:border-t-cyan-400" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        Zap,
        Sparkles,
        Building2,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30">
            <DashboardHeader
                userName={session.user.name || ''}
                userEmail={session.user.email || ''}
                userImage={profileImage}
                onSignOut={handleSignOut}
                subscriptionTier={subscriptionTier}
                unreadNotificationCount={unreadNotificationCount}
            />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-4xl font-bold text-transparent">
                        Account Settings
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your profile, subscription, and billing information</p>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Profile & Address */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Profile Picture Section */}
                        <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-2">
                                        <Star className="h-4 w-4 text-white" />
                                    </div>
                                    Profile Picture
                                </CardTitle>
                                <CardDescription>Update your profile picture</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfilePictureUpload currentImageUrl={profileImage} onImageUpdate={setProfileImage} />
                            </CardContent>
                        </Card>

                        {/* Address Section */}
                        <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-2">
                                        <MapPin className="h-4 w-4 text-white" />
                                    </div>
                                    Shipping Address
                                </CardTitle>
                                <CardDescription>Add your address to order QR code stickers or wallet cards</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AddressForm address={address} onAddressChange={setAddress} />
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleAddressSave} disabled={isSaving} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? 'Saving...' : 'Save Address'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Billing Info Section */}
                        <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-2">
                                        <CreditCard className="h-4 w-4 text-white" />
                                    </div>
                                    Billing Information
                                </CardTitle>
                                <CardDescription>Manage your payment methods and billing details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
                                    <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-500" />
                                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">No payment method on file</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Add a payment method to subscribe to a plan</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Subscription Tiers */}
                    <div className="space-y-6">
                        {/* Current Subscription Status */}
                        {subscription && subscription.status === 'active' && (
                            <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <CardHeader>
                                    <CardTitle>Current Subscription</CardTitle>
                                    <CardDescription>Manage your active subscription</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 p-4 dark:from-rose-950/50 dark:to-pink-950/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900 capitalize dark:text-gray-100">{subscription.tier} Plan</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Billed {subscription.billingPeriod === 'month' ? 'monthly' : 'annually'}
                                                </p>
                                                {subscription.currentPeriodEnd && (
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {subscription.cancelAtPeriodEnd ? (
                                            <div className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/30">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                    Your subscription will cancel at the end of the billing period.
                                                </p>
                                                <Button
                                                    onClick={handleResumeSubscription}
                                                    disabled={isLoadingSubscription}
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                >
                                                    Resume Subscription
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={handleCancelSubscription}
                                                disabled={isLoadingSubscription}
                                                variant="outline"
                                                size="sm"
                                                className="mt-4"
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel Subscription
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle>Subscription Plans</CardTitle>
                                <CardDescription>Choose the plan that's right for you</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Billing Period Selector */}
                                <div className="flex gap-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                                    <button
                                        onClick={() => setSelectedPeriod('month')}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            selectedPeriod === 'month'
                                                ? 'bg-rose-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setSelectedPeriod('year')}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            selectedPeriod === 'year'
                                                ? 'bg-rose-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Yearly
                                        <span className="ml-1 text-xs">(Save 20%)</span>
                                    </button>
                                </div>
                                {SUBSCRIPTION_TIERS.map((tier) => {
                                    const Icon = iconMap[tier.iconName] || Zap;
                                    const isCurrentTier = subscriptionTier === tier.id;
                                    const isUpgrade =
                                        subscriptionTier === 'free' ||
                                        (subscriptionTier === 'basic' && tier.id === 'pro') ||
                                        (subscriptionTier === 'basic' && tier.id === 'premium') ||
                                        (subscriptionTier === 'pro' && tier.id === 'premium');

                                    return (
                                        <motion.div
                                            key={tier.id}
                                            whileHover={{ scale: 1.02 }}
                                            className={`relative rounded-lg border-2 p-4 transition-all ${
                                                tier.popular
                                                    ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md dark:border-rose-500 dark:from-rose-950/50 dark:to-pink-950/50'
                                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                            } ${isCurrentTier ? 'ring-2 ring-rose-500 dark:ring-rose-400' : ''}`}
                                        >
                                            {tier.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <span className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                                                        Most Popular
                                                    </span>
                                                </div>
                                            )}
                                            {isCurrentTier && (
                                                <div className="absolute -top-2 -right-2 rounded-full bg-green-500 p-1">
                                                    <Star className="h-3 w-3 fill-white text-white" />
                                                </div>
                                            )}
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`rounded-lg bg-gradient-to-br ${tier.color} p-2`}>
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tier.name}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {tier.price}
                                                            <span className="text-xs">/{tier.period}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <ul className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                {tier.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="mt-0.5 text-cyan-500 dark:text-cyan-400">✓</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                onClick={() => handleUpgrade(tier.id)}
                                                disabled={isCurrentTier || !isUpgrade || isLoadingSubscription}
                                                variant={tier.popular ? 'default' : 'outline'}
                                                className={`w-full ${
                                                    tier.popular
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                                                        : ''
                                                }`}
                                            >
                                                {isLoadingSubscription
                                                    ? 'Loading...'
                                                    : isCurrentTier
                                                      ? 'Current Plan'
                                                      : `Upgrade to ${selectedPeriod === 'year' ? 'Yearly' : 'Monthly'}`}
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
