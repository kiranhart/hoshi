import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production']).default('development'),
        DATABASE_URL: z.string().url().optional(),
        BETTER_AUTH_SECRET: z.string().optional(),
        BETTER_AUTH_URL: z.string().url().optional(),
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        MICROSOFT_CLIENT_ID: z.string().optional(),
        MICROSOFT_CLIENT_SECRET: z.string().optional(),
        APPLE_CLIENT_ID: z.string().optional(),
        APPLE_CLIENT_SECRET: z.string().optional(),
        UPLOADTHING_SECRET: z.string().optional(),
        UPLOADTHING_APP_ID: z.string().optional(),
    },
    emptyStringAsUndefined: true,
    // eslint-disable-next-line n/no-process-env
    experimental__runtimeEnv: process.env
});