import db from '@/db';
import { schema } from '@/db/schema';
import { env } from '@/env/server';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from 'better-auth/next-js';
// Note: Admin assignment for first user is handled by the migration script
// See scripts/apply-admin-migration.ts


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'mysql',
        schema: schema
    }),
    baseURL: env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === 'production' 
        ? `https://${process.env.VERCEL_URL || 'localhost:3000'}`
        : 'http://localhost:3000'),
    secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
    socialProviders: {
        google: {
            prompt: "select_account", 
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string
        },
        ...(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
            ? {
                  microsoft: {
                      clientId: env.MICROSOFT_CLIENT_ID,
                      clientSecret: env.MICROSOFT_CLIENT_SECRET,
                  },
              }
            : {}),
        ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
            ? {
                  apple: {
                      clientId: env.APPLE_CLIENT_ID,
                      clientSecret: env.APPLE_CLIENT_SECRET,
                  },
              }
            : {}),
    },
    plugins: [nextCookies()]
})