import type { Metadata } from 'next';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
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
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('medilink-theme') || 'light';
                                    const html = document.documentElement;
                                    if (theme === 'dark') {
                                        html.classList.add('dark');
                                    } else {
                                        html.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="light" storageKey="medilink-theme">
                    {children}
                    <Toaster position="top-right" richColors />
                </ThemeProvider>
            </body>
        </html>
    );
}
