import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-utils';
import db from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminStatus = await isAdmin(req.headers);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, username, isAdmin: isAdminValue, emailVerified } = body;

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (isAdminValue !== undefined) updateData.isAdmin = isAdminValue;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    // Update user
    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, params.id));

    // Fetch updated user
    const [updatedUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, params.id))
      .limit(1);

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Handle unique constraint violations
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminStatus = await isAdmin(req.headers);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete user (cascade will handle related records)
    await db.delete(user).where(eq(user.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

