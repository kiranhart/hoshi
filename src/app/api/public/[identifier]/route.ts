import db from '@/db';
import { page, user, medicine, allergy, emergencyContact } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    // Try to find page by username or uniqueKey
    const pageData = await db
      .select()
      .from(page)
      .where(or(eq(page.username, identifier), eq(page.uniqueKey, identifier)))
      .limit(1);

    if (pageData.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const foundPage = pageData[0];

    // Check if accessed by username and page is private
    // If accessed by uniqueKey (UUID), allow access even if private
    const isAccessingByUsername = foundPage.username === identifier;
    const isAccessingByUniqueKey = foundPage.uniqueKey === identifier;

    if (isAccessingByUsername && foundPage.isPrivate) {
      return NextResponse.json(
        { error: 'This page is private', isPrivate: true },
        { status: 403 }
      );
    }

    // Get user data for the image
    const userData = await db
      .select({ image: user.image, name: user.name })
      .from(user)
      .where(eq(user.id, foundPage.userId))
      .limit(1);

    // Get medicines
    const medicines = await db
      .select()
      .from(medicine)
      .where(eq(medicine.pageId, foundPage.id));

    // Get allergies
    const allergies = await db
      .select()
      .from(allergy)
      .where(eq(allergy.pageId, foundPage.id));

    // Get emergency contacts
    const contacts = await db
      .select()
      .from(emergencyContact)
      .where(eq(emergencyContact.pageId, foundPage.id));

    return NextResponse.json({
      page: {
        ...foundPage,
        userImage: userData[0]?.image || null,
        userName: userData[0]?.name || null,
      },
      medicines,
      allergies,
      contacts,
    });
  } catch (error) {
    console.error('Error fetching public page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

