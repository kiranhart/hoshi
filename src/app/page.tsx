'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const numStars = 150;
        const minZ = 0.5; // prevents division by zero / extremely small z
        const stars: { x: number; y: number; z: number }[] = [];

        const createStar = () => ({
            x: Math.random() * width - width / 2,
            y: Math.random() * height - height / 2,
            z: Math.random() * width + minZ, // ensure z >= minZ
        });

        for (let i = 0; i < numStars; i++) stars.push(createStar());

        const draw = () => {
            ctx.fillStyle = '#030014';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < numStars; i++) {
                const star = stars[i];
                star.z -= 1.5;

                // Respawn when too close (or negative)
                if (star.z <= minZ) {
                    stars[i] = createStar();
                    continue;
                }

                const k = 128 / star.z;
                const px = star.x * k + width / 2;
                const py = star.y * k + height / 2;

                // size calculation clamped to a positive minimum to avoid negative radii
                const rawSize = (1 - star.z / width) * 2;
                const size = Math.max(0.25, rawSize);

                // Only draw if on-screen and size is finite
                if (Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(size) && size > 0 && px >= 0 && px <= width && py >= 0 && py <= height) {
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - star.z / width)})`;
                    ctx.fill();
                }
            }

            requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030014] text-gray-100">
            {/* Starfield Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Glow + Noise Layers */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(50,50,100,0.3),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

            {/* Hero Section */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="z-10 px-6 text-center">
                <motion.div
                    className="mb-6 flex justify-center"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                >
                    <Star className="h-14 w-14 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                </motion.div>

                <h1 className="mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                    Hoshi
                </h1>
                <p className="mx-auto mb-8 max-w-xl text-lg text-gray-400">A minimalist Next.js starter to quick-start development</p>

                <div className="flex justify-center gap-4">
                    <Link href="/sign-in" className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black shadow-lg transition hover:bg-cyan-400">
                        Sign In
                    </Link>
                </div>
            </motion.div>

            {/* Features */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                viewport={{ once: true }}
                className="z-10 mt-32 grid max-w-5xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-3"
            >
                {[
                    { title: '🎨 Beautifully Styled', desc: 'TailwindCSS and Framer Motion out of the box.' },
                    { title: '🪶 Lightweight', desc: 'No bloat, just the minimum needed' },
                    { title: '🔑 Better-Auth', desc: 'Better-Auth + Drizzle setup out of the box' },
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-cyan-400/40"
                    >
                        <h3 className="mb-2 text-xl font-semibold text-cyan-300">{f.title}</h3>
                        <p className="text-gray-400">{f.desc}</p>
                    </motion.div>
                ))}
            </motion.section>

            {/* Footer */}
            <footer className="z-10 mt-32 mb-10 text-sm text-gray-600">
                <p>
                    Made with <span className="text-cyan-400">★</span> by{' '}
                    <Link href="https://github.com/kiranhart" className="transition hover:text-cyan-300">
                        Kiran Hart
                    </Link>{' '}
                    • © {new Date().getFullYear()} Hoshi - NextJS Starter
                </p>
            </footer>
        </main>
    );
}
