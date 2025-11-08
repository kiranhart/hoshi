import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-utils';
import db from '@/db';
import { order, orderItem, product, user, userAddress } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
    try {
        const adminStatus = await isAdmin(req.headers);
        if (!adminStatus) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const orders = await db
            .select({
                order: order,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(order)
            .innerJoin(user, eq(order.userId, user.id))
            .orderBy(desc(order.createdAt));

        const ordersWithItems = await Promise.all(
            orders.map(async ({ order: o, user: u }) => {
                const items = await db
                    .select({
                        id: orderItem.id,
                        quantity: orderItem.quantity,
                        unitPrice: orderItem.unitPrice,
                        totalPrice: orderItem.totalPrice,
                        product: {
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            imageUrl: product.imageUrl,
                        },
                    })
                    .from(orderItem)
                    .innerJoin(product, eq(orderItem.productId, product.id))
                    .where(eq(orderItem.orderId, o.id));

                let shippingAddress = null;
                if (o.shippingAddressId) {
                    const address = await db
                        .select()
                        .from(userAddress)
                        .where(eq(userAddress.id, o.shippingAddressId))
                        .limit(1);
                    shippingAddress = address[0] || null;
                }

                return {
                    ...o,
                    user: u,
                    items,
                    shippingAddress,
                };
            })
        );

        return NextResponse.json({ orders: ordersWithItems });
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const adminStatus = await isAdmin(req.headers);
        if (!adminStatus) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { orderId, status, trackingNumber, notes } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const existingOrder = await db
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);

        if (existingOrder.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
        if (notes !== undefined) updateData.notes = notes || null;

        await db.update(order).set(updateData).where(eq(order.id, orderId));

        // Create notification for user
        const userId = existingOrder[0].userId;
        let notificationTitle = 'Order Update';
        let notificationMessage = `Your order status has been updated to ${status || existingOrder[0].status}.`;

        if (trackingNumber) {
            notificationMessage += ` Tracking number: ${trackingNumber}`;
        }

        await createNotification(
            userId,
            'order_update',
            notificationTitle,
            notificationMessage,
            orderId
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

