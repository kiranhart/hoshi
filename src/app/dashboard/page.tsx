'use client';

import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
    const session = authClient.useSession(); // directly read the session from cookie

    console.log(session);

    if (!session) return <p>Loading...</p>;

    return (
        <div>
            <h1>{session.data?.user.name}</h1>
        </div>
    );
}
