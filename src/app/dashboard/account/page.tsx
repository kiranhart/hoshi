'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Building2, CreditCard, MapPin, Save, Sparkles, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { type AddressData, AddressForm } from '@/components/dashboard/AddressForm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfilePictureUpload } from '@/components/dashboard/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/constants';

export default function AccountSettingsPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

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
            setProfileImage(session.user.image || null);
            // TODO: Load subscription tier and address from API
            // For now, using mock data
            setIsLoading(false);
        }
    }, [session]);

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
            // TODO: Implement API call to save address
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Address saved successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgrade = (tier: 'basic' | 'pro' | 'premium') => {
        // TODO: Implement Stripe checkout
        toast.info(`Redirecting to checkout for ${tier} plan...`);
        // This would typically redirect to Stripe checkout
        // window.location.href = `/api/stripe/checkout?tier=${tier}`;
    };

    if (isPending || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-500" />
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
            <DashboardHeader
                userName={session.user.name || ''}
                userEmail={session.user.email || ''}
                userImage={profileImage}
                onSignOut={handleSignOut}
                subscriptionTier={subscriptionTier}
            />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6 text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-4xl font-bold text-transparent">
                        Account Settings
                    </h1>
                    <p className="mt-2 text-gray-600">Manage your profile, subscription, and billing information</p>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Profile & Address */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Profile Picture Section */}
                        <Card className="border-gray-200 shadow-sm">
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
                        <Card className="border-gray-200 shadow-sm">
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
                        <Card className="border-gray-200 shadow-sm">
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
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                    <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="mb-2 text-sm font-medium text-gray-700">No payment method on file</p>
                                    <p className="text-xs text-gray-500">Add a payment method to subscribe to a plan</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Subscription Tiers */}
                    <div className="space-y-6">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Subscription Plans</CardTitle>
                                <CardDescription>Choose the plan that's right for you</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                                    ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md'
                                                    : 'border-gray-200 bg-white'
                                            } ${isCurrentTier ? 'ring-2 ring-rose-500' : ''}`}
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
                                                        <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {tier.price}
                                                            <span className="text-xs">/{tier.period}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <ul className="mb-4 space-y-2 text-sm text-gray-600">
                                                {tier.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="mt-0.5 text-cyan-500">✓</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                onClick={() => handleUpgrade(tier.id)}
                                                disabled={isCurrentTier || !isUpgrade}
                                                variant={tier.popular ? 'default' : 'outline'}
                                                className={`w-full ${
                                                    tier.popular
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                                                        : ''
                                                }`}
                                            >
                                                {isCurrentTier ? 'Current Plan' : 'Upgrade'}
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
