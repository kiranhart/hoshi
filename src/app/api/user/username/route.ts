import { auth } from '@/lib/auth';
import db from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await db.select({ username: user.username }).from(user).where(eq(user.id, session.user.id)).limit(1);
    
    return NextResponse.json({ 
      username: userData[0]?.username || null,
      hasUsername: !!userData[0]?.username 
    });
  } catch (error) {
    console.error('Error fetching username:', error);
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
    const { username } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-50 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens' 
      }, { status: 400 });
    }

    // Check if username is already taken
    const existingUser = await db.select().from(user).where(eq(user.username, username)).limit(1);
    if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Update user with username
    await db.update(user).set({ username }).where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, username });
  } catch (error: any) {
    console.error('Error setting username:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

