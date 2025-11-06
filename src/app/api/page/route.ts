import { auth } from '@/lib/auth';
import db from '@/db';
import { page, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's username
    const userData = await db.select({ username: user.username }).from(user).where(eq(user.id, session.user.id)).limit(1);
    const username = userData[0]?.username;

    if (!username) {
      return NextResponse.json({ error: 'Username not set' }, { status: 400 });
    }

    // Get or create page
    let pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      // Create page if it doesn't exist
      const uniqueKey = randomUUID();
      await db.insert(page).values({
        id: randomUUID(),
        userId: session.user.id,
        username,
        uniqueKey,
        isPrivate: false,
      });
      pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    }

    return NextResponse.json({ page: pageData[0] });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, description, isPrivate } = body;

    // Get user's username
    const userData = await db.select({ username: user.username }).from(user).where(eq(user.id, session.user.id)).limit(1);
    const username = userData[0]?.username;

    if (!username) {
      return NextResponse.json({ error: 'Username not set' }, { status: 400 });
    }

    // Check if page exists
    let pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      // Create page if it doesn't exist
      const uniqueKey = randomUUID();
      await db.insert(page).values({
        id: randomUUID(),
        userId: session.user.id,
        username,
        uniqueKey,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        description: description || null,
        isPrivate: isPrivate ?? false,
      });
    } else {
      // Update existing page
      await db.update(page)
        .set({
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          phone: phone || null,
          description: description || null,
          isPrivate: isPrivate ?? pageData[0].isPrivate,
        })
        .where(eq(page.userId, session.user.id));
    }

    // Return updated page
    const updatedPage = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    return NextResponse.json({ page: updatedPage[0] });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

