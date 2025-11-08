import { auth } from '@/lib/auth';
import db from '@/db';
import { page, medicine } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { medicineIds } = body; // Array of medicine IDs in the new order

    if (!Array.isArray(medicineIds) || medicineIds.length === 0) {
      return NextResponse.json({ error: 'Invalid medicine IDs array' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Verify all medicines belong to user's page
    const existingMedicines = await db.select().from(medicine)
      .where(and(
        eq(medicine.pageId, pageData[0].id),
        inArray(medicine.id, medicineIds)
      ));

    if (existingMedicines.length !== medicineIds.length) {
      return NextResponse.json({ error: 'Some medicines not found' }, { status: 404 });
    }

    // Update display order for each medicine
    const updatePromises = medicineIds.map((medicineId: string, index: number) => {
      return db.update(medicine)
        .set({ displayOrder: index })
        .where(eq(medicine.id, medicineId));
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering medicines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

