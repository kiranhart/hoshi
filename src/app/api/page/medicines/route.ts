import { auth } from '@/lib/auth';
import db from '@/db';
import { page, medicine } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ medicines: [] });
    }

    const medicines = await db.select().from(medicine).where(eq(medicine.pageId, pageData[0].id));
    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('Error fetching medicines:', error);
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
    const { name, dosage, frequency } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found. Please set up your page first.' }, { status: 404 });
    }

    const medicineId = randomUUID();
    await db.insert(medicine).values({
      id: medicineId,
      pageId: pageData[0].id,
      name: name.trim(),
      dosage: dosage?.trim() || null,
      frequency: frequency?.trim() || null,
    });

    const created = await db.select().from(medicine).where(eq(medicine.id, medicineId)).limit(1);
    return NextResponse.json({ medicine: created[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

