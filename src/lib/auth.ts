import db from '@/db';
import { schema } from '@/db/schema';
import { env } from '@/env/server';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from 'better-auth/next-js';


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'mysql',
        schema: schema
    }),
    socialProviders: {
        google: {
            prompt: "select_account", 
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string
        }
    },
    plugins: [nextCookies()]
})