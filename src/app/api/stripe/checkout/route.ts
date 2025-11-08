import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, getStripePriceId } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/admin-utils';
import db from '@/db';
import { subscription, product } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/env/server';

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, tier, period, productId, quantity = 1 } = body;

        if (type === 'subscription') {
            // Handle subscription checkout
            if (!tier || !period) {
                return NextResponse.json({ error: 'Tier and period are required' }, { status: 400 });
            }

            const user = await getCurrentUser(req.headers);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Check if user already has an active subscription
            const existingSub = await db
                .select()
                .from(subscription)
                .where(eq(subscription.userId, session.user.id))
                .limit(1);

            let customerId: string;
            if (existingSub.length > 0 && existingSub[0].stripeCustomerId) {
                customerId = existingSub[0].stripeCustomerId;
            } else {
                // Create Stripe customer
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: {
                        userId: session.user.id,
                    },
                });
                customerId = customer.id;
            }

            const priceId = getStripePriceId(tier, period);
            const baseUrl = env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';

            const checkoutSession = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${baseUrl}/dashboard/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/dashboard/account?canceled=true`,
                metadata: {
                    userId: session.user.id,
                    tier,
                    period,
                    type: 'subscription',
                },
            });

            return NextResponse.json({ url: checkoutSession.url });
        } else if (type === 'product') {
            // Handle one-time product purchase
            if (!productId) {
                return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
            }

            const productData = await db
                .select()
                .from(product)
                .where(eq(product.id, productId))
                .limit(1);

            if (productData.length === 0 || !productData[0].isActive) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            const user = await getCurrentUser(req.headers);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Get or create Stripe customer
            const existingSub = await db
                .select()
                .from(subscription)
                .where(eq(subscription.userId, session.user.id))
                .limit(1);

            let customerId: string;
            if (existingSub.length > 0 && existingSub[0].stripeCustomerId) {
                customerId = existingSub[0].stripeCustomerId;
            } else {
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: {
                        userId: session.user.id,
                    },
                });
                customerId = customer.id;
            }

            const baseUrl = env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';

            const checkoutSession = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: productData[0].stripePriceId || undefined,
                        quantity,
                    },
                ],
                success_url: `${baseUrl}/dashboard/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/dashboard/orders?canceled=true`,
                metadata: {
                    userId: session.user.id,
                    productId,
                    quantity: quantity.toString(),
                    type: 'product',
                },
            });

            return NextResponse.json({ url: checkoutSession.url });
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

