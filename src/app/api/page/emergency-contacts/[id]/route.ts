import { auth } from '@/lib/auth';
import db from '@/db';
import { page, emergencyContact } from '@/db/schema';
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
    const { name, phone, email, relation } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Contact name is required' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify contact belongs to user's page
    const existingContact = await db.select().from(emergencyContact)
      .where(and(eq(emergencyContact.id, id), eq(emergencyContact.pageId, pageData[0].id)))
      .limit(1);

    if (existingContact.length === 0) {
      return NextResponse.json({ error: 'Emergency contact not found' }, { status: 404 });
    }

    await db.update(emergencyContact)
      .set({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        relation: relation?.trim() || null,
      })
      .where(eq(emergencyContact.id, id));

    const updated = await db.select().from(emergencyContact).where(eq(emergencyContact.id, id)).limit(1);
    return NextResponse.json({ contact: updated[0] });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
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

    // Verify contact belongs to user's page
    const existingContact = await db.select().from(emergencyContact)
      .where(and(eq(emergencyContact.id, id), eq(emergencyContact.pageId, pageData[0].id)))
      .limit(1);

    if (existingContact.length === 0) {
      return NextResponse.json({ error: 'Emergency contact not found' }, { status: 404 });
    }

    await db.delete(emergencyContact).where(eq(emergencyContact.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

