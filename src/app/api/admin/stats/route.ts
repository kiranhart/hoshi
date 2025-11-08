import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-utils';
import db from '@/db';
import { user, medicine, diagnosis, allergy } from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const adminStatus = await isAdmin(req.headers);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get statistics
    const [userCount] = await db.select({ count: count() }).from(user);
    const [medicineCount] = await db.select({ count: count() }).from(medicine);
    const [diagnosisCount] = await db.select({ count: count() }).from(diagnosis);
    const [allergyCount] = await db.select({ count: count() }).from(allergy);

    return NextResponse.json({
      users: userCount?.count || 0,
      medicines: medicineCount?.count || 0,
      diagnoses: diagnosisCount?.count || 0,
      allergies: allergyCount?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

