'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import { Mail, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function SignInPage() {
    const providers = [{ name: 'Google', icon: Mail, color: 'from-amber-400 to-red-500' }];

    const signInWithGoogle = () => {
        authClient.signIn.social({
            provider: 'google',
            callbackURL: '/dashboard', // redirect after sign-in
        });
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030014] text-gray-100">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(50,50,100,0.3),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

            {/* Rotating star */}
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }} className="mb-6">
                <Star className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
            </motion.div>

            {/* Sign-in card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-md"
            >
                <h1 className="mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-center text-3xl font-bold text-transparent">
                    Welcome to Hoshi
                </h1>
                <p className="mb-8 text-center text-gray-400">Sign in with one of the constellations below ✨</p>

                <div className="space-y-3">
                    {providers.map(({ name, icon: Icon, color }) => (
                        <Button
                            key={name}
                            variant="outline"
                            className={cn(
                                'group relative w-full cursor-pointer overflow-hidden border-white/10 bg-white/5 font-semibold text-gray-100 hover:text-black'
                            )}
                            onClick={signInWithGoogle}
                            type="button"
                        >
                            <span
                                className={cn(
                                    'absolute inset-0 -z-10 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                                    color
                                )}
                            />
                            <Icon className="mr-2 h-5 w-5" />
                            Sign in with {name}
                        </Button>
                    ))}
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Don’t have access yet?{' '}
                    <Link href="/" className="text-cyan-400 transition hover:text-cyan-300">
                        Return Home
                    </Link>
                </p>
            </motion.div>

            <footer className="z-10 mt-16 text-sm text-gray-600">
                <p>
                    Made with <span className="text-cyan-400">★</span> — Hoshi Starter
                </p>
            </footer>
        </main>
    );
}
