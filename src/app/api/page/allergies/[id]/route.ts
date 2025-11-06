import { auth } from '@/lib/auth';
import db from '@/db';
import { page, allergy } from '@/db/schema';
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
    const { name, reaction, severity, isMedicine } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Allergy name is required' }, { status: 400 });
    }

    // Validate severity
    const validSeverities = ['mild', 'moderate', 'severe', 'life-threatening'];
    const allergySeverity = severity && validSeverities.includes(severity) ? severity : 'mild';

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify allergy belongs to user's page
    const existingAllergy = await db.select().from(allergy)
      .where(and(eq(allergy.id, id), eq(allergy.pageId, pageData[0].id)))
      .limit(1);

    if (existingAllergy.length === 0) {
      return NextResponse.json({ error: 'Allergy not found' }, { status: 404 });
    }

    await db.update(allergy)
      .set({ 
        name: name.trim(),
        reaction: reaction?.trim() || null,
        severity: allergySeverity,
        isMedicine: isMedicine === true,
      })
      .where(eq(allergy.id, id));

    const updated = await db.select().from(allergy).where(eq(allergy.id, id)).limit(1);
    return NextResponse.json({ allergy: updated[0] });
  } catch (error) {
    console.error('Error updating allergy:', error);
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

    // Verify allergy belongs to user's page
    const existingAllergy = await db.select().from(allergy)
      .where(and(eq(allergy.id, id), eq(allergy.pageId, pageData[0].id)))
      .limit(1);

    if (existingAllergy.length === 0) {
      return NextResponse.json({ error: 'Allergy not found' }, { status: 404 });
    }

    await db.delete(allergy).where(eq(allergy.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

