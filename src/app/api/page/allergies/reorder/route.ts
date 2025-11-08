import { auth } from '@/lib/auth';
import db from '@/db';
import { page, allergy } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { allergyIds } = body; // Array of allergy IDs in the new order

    if (!Array.isArray(allergyIds) || allergyIds.length === 0) {
      return NextResponse.json({ error: 'Invalid allergy IDs array' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify all allergies belong to user's page
    const existingAllergies = await db.select().from(allergy)
      .where(and(
        eq(allergy.pageId, pageData[0].id),
        inArray(allergy.id, allergyIds)
      ));

    if (existingAllergies.length !== allergyIds.length) {
      return NextResponse.json({ error: 'Some allergies not found' }, { status: 404 });
    }

    // Update display order for each allergy
    const updatePromises = allergyIds.map((allergyId: string, index: number) => {
      return db.update(allergy)
        .set({ displayOrder: index })
        .where(eq(allergy.id, allergyId));
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering allergies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

