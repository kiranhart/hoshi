import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/env/server';
import db from '@/db';
import { subscription, order, orderItem, product, user, userAddress } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error('No userId in checkout session metadata');
                    break;
                }

                if (session.mode === 'subscription') {
                    // Handle subscription creation
                    const subscriptionData = (await stripe.subscriptions.retrieve(session.subscription as string)) as any;
                    const tier = session.metadata?.tier;
                    const period = session.metadata?.period;

                    // Check if subscription already exists
                    const existing = await db
                        .select()
                        .from(subscription)
                        .where(eq(subscription.stripeSubscriptionId, subscriptionData.id))
                        .limit(1);

                    if (existing.length === 0) {
                        await db.insert(subscription).values({
                            id: randomUUID(),
                            userId,
                            stripeSubscriptionId: subscriptionData.id,
                            stripeCustomerId: typeof subscriptionData.customer === 'string' ? subscriptionData.customer : subscriptionData.customer.id,
                            tier,
                            status: subscriptionData.status,
                            billingPeriod: period,
                            currentPeriodStart: subscriptionData.current_period_start ? new Date(subscriptionData.current_period_start * 1000) : null,
                            currentPeriodEnd: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000) : null,
                            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
                        });

                        await createNotification(
                            userId,
                            'subscription_update',
                            'Subscription Activated',
                            `Your ${tier} subscription has been activated successfully!`
                        );
                    }
                } else if (session.mode === 'payment') {
                    // Handle one-time product purchase
                    const productId = session.metadata?.productId;
                    const quantity = parseInt(session.metadata?.quantity || '1');

                    if (productId) {
                        const productData = await db
                            .select()
                            .from(product)
                            .where(eq(product.id, productId))
                            .limit(1);

                        if (productData.length > 0) {
                            const orderId = randomUUID();
                            const unitPrice = parseFloat(productData[0].price.toString());
                            const totalPrice = unitPrice * quantity;

                            // Get user's default address if available
                            const userAddresses = await db
                                .select()
                                .from(userAddress)
                                .where(eq(userAddress.userId, userId))
                                .limit(1);

                            await db.insert(order).values({
                                id: orderId,
                                userId,
                                stripePaymentIntentId: session.payment_intent as string,
                                stripeCheckoutSessionId: session.id,
                                totalAmount: totalPrice.toString(),
                                currency: productData[0].currency,
                                status: 'pending',
                                shippingAddressId: userAddresses.length > 0 ? userAddresses[0].id : null,
                            });

                            await db.insert(orderItem).values({
                                id: randomUUID(),
                                orderId,
                                productId,
                                quantity,
                                unitPrice: unitPrice.toString(),
                                totalPrice: totalPrice.toString(),
                            });

                            await createNotification(
                                userId,
                                'order_update',
                                'Order Placed',
                                `Your order for ${productData[0].name} has been placed successfully!`,
                                orderId
                            );
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscriptionData = event.data.object as any;
                const stripeSubscriptionId = subscriptionData.id;

                const existing = await db
                    .select()
                    .from(subscription)
                    .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId))
                    .limit(1);

                if (existing.length > 0) {
                    await db
                        .update(subscription)
                        .set({
                            status: subscriptionData.status,
                            currentPeriodStart: subscriptionData.current_period_start ? new Date(subscriptionData.current_period_start * 1000) : null,
                            currentPeriodEnd: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000) : null,
                            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
                            canceledAt: subscriptionData.canceled_at
                                ? new Date(subscriptionData.canceled_at * 1000)
                                : null,
                        })
                        .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId));

                    const userId = existing[0].userId;
                    if (event.type === 'customer.subscription.deleted') {
                        await createNotification(
                            userId,
                            'subscription_update',
                            'Subscription Canceled',
                            'Your subscription has been canceled. You will continue to have access until the end of your billing period.'
                        );
                    } else if (subscriptionData.cancel_at_period_end) {
                        await createNotification(
                            userId,
                            'subscription_update',
                            'Subscription Will Cancel',
                            'Your subscription will cancel at the end of the current billing period.'
                        );
                    }
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                const stripeSubscriptionId = invoice.subscription;

                if (stripeSubscriptionId) {
                    const existing = await db
                        .select()
                        .from(subscription)
                        .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId as string))
                        .limit(1);

                    if (existing.length > 0) {
                        await db
                            .update(subscription)
                            .set({
                                currentPeriodStart: new Date(invoice.period_start * 1000),
                                currentPeriodEnd: new Date(invoice.period_end * 1000),
                            })
                            .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId as string));
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                const stripeSubscriptionId = invoice.subscription;

                if (stripeSubscriptionId) {
                    const existing = await db
                        .select()
                        .from(subscription)
                        .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId as string))
                        .limit(1);

                    if (existing.length > 0) {
                        await db
                            .update(subscription)
                            .set({
                                status: 'past_due',
                            })
                            .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId as string));

                        await createNotification(
                            existing[0].userId,
                            'subscription_update',
                            'Payment Failed',
                            'Your subscription payment failed. Please update your payment method.'
                        );
                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

