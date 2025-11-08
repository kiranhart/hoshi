// Application constants

export interface SubscriptionTierConfig {
    id: 'basic' | 'pro' | 'premium';
    name: string;
    price: string;
    period: string;
    features: string[];
    iconName: 'Zap' | 'Sparkles' | 'Building2';
    color: string;
    popular: boolean;
}

export const SUBSCRIPTION_TIERS: SubscriptionTierConfig[] = [
    {
        id: 'basic',
        name: 'Basic',
        price: '$4.99',
        period: 'month',
        features: ['Private profiles', 'Custom branding', 'Priority support', 'Basic analytics'],
        iconName: 'Zap',
        color: 'from-rose-400 to-pink-500',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$9.99',
        period: 'month',
        features: ['Everything in Basic', 'Advanced analytics', 'Multiple profiles', 'API access', 'Custom domains'],
        iconName: 'Sparkles',
        color: 'from-pink-500 to-rose-500',
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$19.99',
        period: 'month',
        features: ['Everything in Pro', 'White-label solution', 'Dedicated support', 'Custom integrations', 'Team management'],
        iconName: 'Building2',
        color: 'from-rose-500 to-pink-600',
        popular: false,
    },
];

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium' | null;

