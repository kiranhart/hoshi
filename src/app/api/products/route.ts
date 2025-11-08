import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const products = await db
            .select()
            .from(product)
            .where(eq(product.isActive, true));

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

