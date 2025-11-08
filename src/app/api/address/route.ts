import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/db';
import { userAddress } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addresses = await db
            .select()
            .from(userAddress)
            .where(eq(userAddress.userId, session.user.id));

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { addressLine1, addressLine2, city, state, postalCode, country, isDefault } = body;

        if (!addressLine1 || !city || !state || !postalCode || !country) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await db
                .update(userAddress)
                .set({ isDefault: false })
                .where(eq(userAddress.userId, session.user.id));
        }

        const addressId = randomUUID();
        await db.insert(userAddress).values({
            id: addressId,
            userId: session.user.id,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state,
            postalCode,
            country,
            isDefault: isDefault || false,
        });

        return NextResponse.json({ success: true, addressId });
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { addressId, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = body;

        if (!addressId) {
            return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await db
            .select()
            .from(userAddress)
            .where(eq(userAddress.id, addressId))
            .limit(1);

        if (existing.length === 0 || existing[0].userId !== session.user.id) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await db
                .update(userAddress)
                .set({ isDefault: false })
                .where(eq(userAddress.userId, session.user.id));
        }

        const updateData: any = {};
        if (addressLine1) updateData.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2 || null;
        if (city) updateData.city = city;
        if (state) updateData.state = state;
        if (postalCode) updateData.postalCode = postalCode;
        if (country) updateData.country = country;
        if (isDefault !== undefined) updateData.isDefault = isDefault;

        await db.update(userAddress).set(updateData).where(eq(userAddress.id, addressId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

