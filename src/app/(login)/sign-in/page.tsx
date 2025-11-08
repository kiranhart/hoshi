'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import { Activity, Heart, Pill, Stethoscope } from 'lucide-react';

import { authClient } from '@/lib/auth-client';

export default function SignInPage() {
    const signInWithProvider = (provider: 'google' | 'microsoft' | 'apple') => {
        authClient.signIn.social({
            provider,
            callbackURL: '/dashboard',
        });
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-gray-900">
            {/* Animated Gradient Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-rose-400/40 via-pink-400/40 to-rose-500/40 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-gradient-to-r from-pink-500/40 via-rose-500/40 to-pink-600/40 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400/30 via-pink-400/30 to-rose-500/30 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Floating Medical Icons */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[
                    { icon: Heart, x: '10%', y: '20%', delay: 0, color: 'text-rose-200' },
                    { icon: Pill, x: '85%', y: '15%', delay: 0.3, color: 'text-pink-200' },
                    { icon: Stethoscope, x: '15%', y: '70%', delay: 0.6, color: 'text-rose-200' },
                    { icon: Activity, x: '90%', y: '75%', delay: 0.9, color: 'text-pink-200' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className={`absolute ${item.color}`}
                        style={{ left: item.x, top: item.y }}
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: item.delay,
                        }}
                    >
                        <item.icon className="h-12 w-12 md:h-16 md:w-16" />
                    </motion.div>
                ))}
            </div>

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md">
                    {/* Logo */}
                    <motion.div
                        className="mb-6 flex justify-center"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 opacity-50 blur-xl" />
                            <div className="relative rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 p-3">
                                <Heart className="h-8 w-8 text-white" fill="white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Title */}
                    <h1 className="mb-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-center text-3xl font-extrabold text-transparent">
                        Welcome to Medi Link
                    </h1>
                    <p className="mb-8 text-center text-gray-600">Sign in or create an account to get started</p>

                    {/* Social Sign In Buttons */}
                    <div className="space-y-3">
                        {/* Google */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signInWithProvider('google')}
                            className="w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </div>
                        </motion.button>

                        {/* Microsoft */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signInWithProvider('microsoft')}
                            className="w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none">
                                    <path fill="#F25022" d="M0 0h11v11H0z" />
                                    <path fill="#00A4EF" d="M12 0h11v11H12z" />
                                    <path fill="#7FBA00" d="M0 12h11v11H0z" />
                                    <path fill="#FFB900" d="M12 12h11v11H12z" />
                                </svg>
                                <span>Continue with Microsoft</span>
                            </div>
                        </motion.button>

                        {/* Apple */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signInWithProvider('apple')}
                            className="w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                <span>Continue with Apple</span>
                            </div>
                        </motion.button>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        <Link href="/" className="text-gray-600 transition hover:text-gray-900">
                            ← Back to home
                        </Link>
                    </p>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative z-10 mt-8 text-center text-sm text-gray-500"
            >
                <p>
                    Made with <span className="text-pink-500">❤️</span> for better healthcare • © {new Date().getFullYear()} Medi Link
                </p>
            </motion.footer>
        </main>
    );
}
