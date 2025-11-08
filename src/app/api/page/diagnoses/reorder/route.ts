import { auth } from '@/lib/auth';
import db from '@/db';
import { page, diagnosis } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { diagnosisIds } = body; // Array of diagnosis IDs in the new order

    if (!Array.isArray(diagnosisIds) || diagnosisIds.length === 0) {
      return NextResponse.json({ error: 'Invalid diagnosis IDs array' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify all diagnoses belong to user's page
    const existingDiagnoses = await db.select().from(diagnosis)
      .where(and(
        eq(diagnosis.pageId, pageData[0].id),
        inArray(diagnosis.id, diagnosisIds)
      ));

    if (existingDiagnoses.length !== diagnosisIds.length) {
      return NextResponse.json({ error: 'Some diagnoses not found' }, { status: 404 });
    }

    // Update display order for each diagnosis
    const updatePromises = diagnosisIds.map((diagnosisId: string, index: number) => {
      return db.update(diagnosis)
        .set({ displayOrder: index })
        .where(eq(diagnosis.id, diagnosisId));
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering diagnoses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

