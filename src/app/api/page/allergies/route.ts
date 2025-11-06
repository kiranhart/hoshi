import { auth } from '@/lib/auth';
import db from '@/db';
import { page, allergy } from '@/db/schema';
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
      return NextResponse.json({ allergies: [] });
    }

    const allergies = await db.select().from(allergy).where(eq(allergy.pageId, pageData[0].id));
    return NextResponse.json({ allergies });
  } catch (error) {
    console.error('Error fetching allergies:', error);
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
    const { name, reaction, severity, isMedicine } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Allergy name is required' }, { status: 400 });
    }

    // Validate severity
    const validSeverities = ['mild', 'moderate', 'severe', 'life-threatening'];
    const allergySeverity = severity && validSeverities.includes(severity) ? severity : 'mild';

    // Get user's page
    const pageData = await db.select().from(page).where(eq(page.userId, session.user.id)).limit(1);
    
    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found. Please set up your page first.' }, { status: 404 });
    }

    const allergyId = randomUUID();
    await db.insert(allergy).values({
      id: allergyId,
      pageId: pageData[0].id,
      name: name.trim(),
      reaction: reaction?.trim() || null,
      severity: allergySeverity,
      isMedicine: isMedicine === true,
    });

    const created = await db.select().from(allergy).where(eq(allergy.id, allergyId)).limit(1);
    return NextResponse.json({ allergy: created[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

