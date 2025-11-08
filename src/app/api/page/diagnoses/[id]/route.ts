import { auth } from '@/lib/auth';
import db from '@/db';
import { page, diagnosis } from '@/db/schema';
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
    const { name, severity, diagnosisDate, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Diagnosis name is required' }, { status: 400 });
    }

    // Validate severity if provided
    const validSeverities = ['mild', 'moderate', 'severe', 'critical'];
    const diagnosisSeverity = severity && validSeverities.includes(severity) ? severity : null;

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify diagnosis belongs to user's page
    const existingDiagnosis = await db.select().from(diagnosis)
      .where(and(eq(diagnosis.id, id), eq(diagnosis.pageId, pageData[0].id)))
      .limit(1);

    if (existingDiagnosis.length === 0) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
    }

    await db.update(diagnosis)
      .set({ 
        name: name.trim(),
        severity: diagnosisSeverity,
        diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
        description: description?.trim() || null,
      })
      .where(eq(diagnosis.id, id));

    const updated = await db.select().from(diagnosis).where(eq(diagnosis.id, id)).limit(1);
    return NextResponse.json({ diagnosis: updated[0] });
  } catch (error) {
    console.error('Error updating diagnosis:', error);
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

    // Verify diagnosis belongs to user's page
    const existingDiagnosis = await db.select().from(diagnosis)
      .where(and(eq(diagnosis.id, id), eq(diagnosis.pageId, pageData[0].id)))
      .limit(1);

    if (existingDiagnosis.length === 0) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
    }

    await db.delete(diagnosis).where(eq(diagnosis.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

