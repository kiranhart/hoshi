import { auth } from '@/lib/auth';
import db from '@/db';
import { page, emergencyContact } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
      return NextResponse.json({ contacts: [] });
    }

    const contacts = await db.select().from(emergencyContact).where(eq(emergencyContact.pageId, pageData[0].id));
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
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
    const { name, phone, email, relation } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Contact name is required' }, { status: 400 });
    }

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found. Please set up your page first.' }, { status: 404 });
    }

    const contactId = randomUUID();
    await db.insert(emergencyContact).values({
      id: contactId,
      pageId: pageData[0].id,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      relation: relation?.trim() || null,
    });

    const created = await db.select().from(emergencyContact).where(eq(emergencyContact.id, contactId)).limit(1);
    return NextResponse.json({ contact: created[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

