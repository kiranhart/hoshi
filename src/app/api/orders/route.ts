import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/db';
import { order, orderItem, product, userAddress } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await db
            .select()
            .from(order)
            .where(eq(order.userId, session.user.id))
            .orderBy(desc(order.createdAt));

        const ordersWithItems = await Promise.all(
            orders.map(async (o) => {
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
                    items,
                    shippingAddress,
                };
            })
        );

        return NextResponse.json({ orders: ordersWithItems });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

