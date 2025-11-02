'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import { StarOff } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030014] text-gray-100">
            {/* Background glow and grain */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(50,50,100,0.3),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

            {/* Animated star icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="z-10 mb-6 flex justify-center"
            >
                <StarOff className="h-16 w-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            </motion.div>

            {/* 404 Text */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="z-10 text-center">
                <h1 className="mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-6xl font-bold text-transparent">404</h1>
                <p className="mb-8 max-w-md text-lg text-gray-400">
                    Looks like this star drifted off into the void. The page you’re looking for doesn’t exist.
                </p>

                <div className="flex justify-center gap-4">
                    <Link href="/" className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black shadow-lg transition hover:bg-cyan-400">
                        Return Home
                    </Link>
                </div>
            </motion.div>

            {/* Decorative stars */}
            <motion.div className="absolute inset-0 z-0" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.5, duration: 1.5 }}>
                <div className="absolute top-1/3 left-1/4 h-1 w-1 rounded-full bg-cyan-300 blur-[1px]" />
                <div className="absolute right-1/4 bottom-1/4 h-1.5 w-1.5 rounded-full bg-blue-400 blur-[2px]" />
                <div className="absolute top-1/4 right-1/2 h-0.5 w-0.5 rounded-full bg-indigo-300 blur-[1px]" />
            </motion.div>

            {/* Footer */}
            <footer className="z-10 mt-20 text-sm text-gray-600">
                <p>
                    Lost among the stars —{' '}
                    <Link href="/" className="text-cyan-400 transition hover:text-cyan-300">
                        head back to base
                    </Link>
                </p>
            </footer>
        </main>
    );
}
