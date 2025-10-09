import createJiti from 'jiti';
import { fileURLToPath } from 'node:url';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti('./src/env/server.ts');

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true
};

export default nextConfig;
