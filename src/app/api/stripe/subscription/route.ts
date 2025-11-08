import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import db from '@/db';
import { subscription } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sub = await db
            .select()
            .from(subscription)
            .where(eq(subscription.userId, session.user.id))
            .limit(1);

        if (sub.length === 0) {
            return NextResponse.json({ subscription: null });
        }

        return NextResponse.json({ subscription: sub[0] });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sub = await db
            .select()
            .from(subscription)
            .where(eq(subscription.userId, session.user.id))
            .limit(1);

        if (sub.length === 0 || !sub[0].stripeSubscriptionId) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        // Cancel subscription at period end
        await stripe.subscriptions.update(sub[0].stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        await db
            .update(subscription)
            .set({
                cancelAtPeriodEnd: true,
            })
            .where(eq(subscription.userId, session.user.id));

        return NextResponse.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action } = body;

        const sub = await db
            .select()
            .from(subscription)
            .where(eq(subscription.userId, session.user.id))
            .limit(1);

        if (sub.length === 0 || !sub[0].stripeSubscriptionId) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        if (action === 'resume') {
            // Resume subscription
            await stripe.subscriptions.update(sub[0].stripeSubscriptionId, {
                cancel_at_period_end: false,
            });

            await db
                .update(subscription)
                .set({
                    cancelAtPeriodEnd: false,
                })
                .where(eq(subscription.userId, session.user.id));

            return NextResponse.json({ success: true, message: 'Subscription resumed' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

