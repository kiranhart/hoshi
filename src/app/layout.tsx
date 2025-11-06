import type { Metadata } from 'next';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
    title: 'Medi Link - Your Medical Information, One Link Away',
    description: 'Share medications, allergies, emergency contacts, and more with a single link. Secure and private medical information sharing.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
