import Stripe from 'stripe';
import { env } from '@/env/server';

if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover',
    typescript: true,
});

// Subscription price IDs - these should be created in Stripe dashboard
// Format: {tier}_{period} e.g., basic_month, pro_year
export const STRIPE_PRICE_IDS: Record<string, string> = {
    basic_month: process.env.STRIPE_PRICE_BASIC_MONTH || '',
    basic_year: process.env.STRIPE_PRICE_BASIC_YEAR || '',
    pro_month: process.env.STRIPE_PRICE_PRO_MONTH || '',
    pro_year: process.env.STRIPE_PRICE_PRO_YEAR || '',
    premium_month: process.env.STRIPE_PRICE_PREMIUM_MONTH || '',
    premium_year: process.env.STRIPE_PRICE_PREMIUM_YEAR || '',
};

export function getStripePriceId(tier: 'basic' | 'pro' | 'premium', period: 'month' | 'year'): string {
    const key = `${tier}_${period}`;
    const priceId = STRIPE_PRICE_IDS[key];
    if (!priceId) {
        throw new Error(`Stripe price ID not found for ${key}`);
    }
    return priceId;
}

