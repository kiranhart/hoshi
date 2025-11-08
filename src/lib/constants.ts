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
        color: 'from-teal-400 to-cyan-500',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$9.99',
        period: 'month',
        features: ['Everything in Basic', 'Advanced analytics', 'Multiple profiles', 'API access', 'Custom domains'],
        iconName: 'Sparkles',
        color: 'from-cyan-400 to-blue-500',
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '$19.99',
        period: 'month',
        features: ['Everything in Pro', 'White-label solution', 'Dedicated support', 'Custom integrations', 'Team management'],
        iconName: 'Building2',
        color: 'from-blue-500 to-indigo-600',
        popular: false,
    },
];

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium' | null;

