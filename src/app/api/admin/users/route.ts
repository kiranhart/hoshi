import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-utils';
import db from '@/db';
import { user } from '@/db/schema';

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const adminStatus = await isAdmin(req.headers);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all users
    const users = await db.select().from(user).orderBy(user.createdAt);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

