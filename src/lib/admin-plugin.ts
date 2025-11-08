import db from '@/db';
import { user } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import type { BetterAuthPlugin } from 'better-auth';

// Note: Plugin structure may have changed in better-auth v1.3.34
// This plugin is currently not used - admin assignment is handled by migration script
export const adminPlugin: BetterAuthPlugin = {
  id: 'admin-plugin',
  hooks: {
    // @ts-ignore - Plugin hooks structure may have changed
    user: {
      created: {
        after: async ({ user: newUser }: any) => {
          try {
            // Check if this is the first user
            const [userCount] = await db
              .select({ count: count() })
              .from(user);
            
            const totalUsers = userCount?.count || 0;
            
            // If this is the first user, make them admin
            if (totalUsers === 1) {
              await db
                .update(user)
                .set({ isAdmin: true })
                .where(eq(user.id, newUser.id));
              
              console.log(`Made first user (${newUser.email}) an admin`);
            }
          } catch (error) {
            console.error('Error in admin plugin:', error);
            // Don't throw - we don't want to break user creation
          }
        },
      },
    },
  },
};

