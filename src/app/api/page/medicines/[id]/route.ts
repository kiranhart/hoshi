import { auth } from '@/lib/auth';
import db from '@/db';
import { page, medicine } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, dosage, frequency } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify medicine belongs to user's page
    const existingMedicine = await db.select().from(medicine)
      .where(and(eq(medicine.id, id), eq(medicine.pageId, pageData[0].id)))
      .limit(1);

    if (existingMedicine.length === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    await db.update(medicine)
      .set({
        name: name.trim(),
        dosage: dosage?.trim() || null,
        frequency: frequency?.trim() || null,
      })
      .where(eq(medicine.id, id));

    const updated = await db.select().from(medicine).where(eq(medicine.id, id)).limit(1);
    return NextResponse.json({ medicine: updated[0] });
  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify medicine belongs to user's page
    const existingMedicine = await db.select().from(medicine)
      .where(and(eq(medicine.id, id), eq(medicine.pageId, pageData[0].id)))
      .limit(1);

    if (existingMedicine.length === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    await db.delete(medicine).where(eq(medicine.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

