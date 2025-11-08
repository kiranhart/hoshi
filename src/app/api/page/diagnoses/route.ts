import { auth } from '@/lib/auth';
import db from '@/db';
import { page, diagnosis } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
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
      return NextResponse.json({ diagnoses: [] });
    }

    const diagnoses = await db.select().from(diagnosis)
      .where(eq(diagnosis.pageId, pageData[0].id))
      .orderBy(asc(diagnosis.displayOrder), asc(diagnosis.createdAt));
    return NextResponse.json({ diagnoses });
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
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
      return NextResponse.json({ error: 'Page not found. Please set up your page first.' }, { status: 404 });
    }

    // Get the max display order to add new item at the end
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`MAX(${diagnosis.displayOrder})` })
      .from(diagnosis)
      .where(eq(diagnosis.pageId, pageData[0].id))
      .limit(1);

    const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

    const diagnosisId = randomUUID();
    await db.insert(diagnosis).values({
      id: diagnosisId,
      pageId: pageData[0].id,
      name: name.trim(),
      severity: diagnosisSeverity,
      diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
      description: description?.trim() || null,
      displayOrder: nextOrder,
    });

    const created = await db.select().from(diagnosis).where(eq(diagnosis.id, diagnosisId)).limit(1);
    return NextResponse.json({ diagnosis: created[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

