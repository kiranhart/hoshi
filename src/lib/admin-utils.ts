import { auth } from '@/lib/auth';
import db from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function isAdmin(headersList?: Headers): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ 
      headers: headersList || await headers() 
    });
    
    if (!session?.user?.id) {
      return false;
    }

    const [userData] = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return userData?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getCurrentUser(headersList?: Headers) {
  try {
    const session = await auth.api.getSession({ 
      headers: headersList || await headers() 
    });
    
    if (!session?.user?.id) {
      return null;
    }

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

