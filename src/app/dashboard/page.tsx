'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { motion } from 'framer-motion';
import { Calendar, Clock, Globe, LogOut, Mail, Shield, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const numStars = 150;
        const minZ = 0.5;
        const stars: { x: number; y: number; z: number }[] = [];

        const createStar = () => ({
            x: Math.random() * width - width / 2,
            y: Math.random() * height - height / 2,
            z: Math.random() * width + minZ,
        });

        for (let i = 0; i < numStars; i++) stars.push(createStar());

        const draw = () => {
            ctx.fillStyle = '#030014';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < numStars; i++) {
                const star = stars[i];
                star.z -= 1.5;

                if (star.z <= minZ) {
                    stars[i] = createStar();
                    continue;
                }

                const k = 128 / star.z;
                const px = star.x * k + width / 2;
                const py = star.y * k + height / 2;

                const rawSize = (1 - star.z / width) * 2;
                const size = Math.max(0.25, rawSize);

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

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push('/');
    };

    if (isPending) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030014] text-gray-100">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        className="mb-4 flex justify-center"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <Star className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                    </motion.div>
                    <p className="text-lg text-gray-400">Loading...</p>
                </motion.div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030014] text-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
                >
                    <p className="text-center text-gray-400">Not authenticated. Please sign in.</p>
                </motion.div>
            </main>
        );
    }

    // Debug: Log session data to check if image exists
    console.log('Session data:', session);
    console.log('User image URL:', session.user?.image);

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#030014] text-gray-100">
            {/* Starfield Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            {/* Glow + Noise Layers */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(50,50,100,0.3),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

            {/* Content */}
            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <header className="border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}>
                                <Star className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                            </motion.div>
                            <h1 className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
                                Hoshi
                            </h1>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                            <div className="hidden items-center gap-3 sm:flex">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="h-8 w-8 rounded-full border border-cyan-400/50 object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load header profile image:', session.user.image);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-400 to-blue-500">
                                        <span className="text-xs font-semibold text-white">{session.user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-100">{session.user.name}</p>
                                    <p className="text-xs text-gray-400">{session.user.email}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                className="border-white/10 bg-white/5 text-gray-100 hover:bg-white/10 hover:text-cyan-400"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </motion.div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-6 py-12">
                    {/* Welcome Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
                        <h2 className="mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                            Welcome back, {session.user.name?.split(' ')[0] || 'User'}! ✨
                        </h2>
                        <p className="text-lg text-gray-400">Here's what's happening with your account today.</p>
                    </motion.div>

                    {/* User Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
                    >
                        <h3 className="mb-6 text-2xl font-semibold text-cyan-300">Profile Information</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="h-12 w-12 rounded-lg border border-cyan-400/50 object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load profile image:', session.user.image);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 p-3">
                                        <Star className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-400">Name</p>
                                    <p className="text-lg font-semibold text-gray-100">{session.user.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 p-3">
                                    <Mail className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="text-lg font-semibold text-gray-100">{session.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 p-3">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Member Since</p>
                                    <p className="text-lg font-semibold text-gray-100">
                                        {session.session?.createdAt
                                            ? new Date(session.session.createdAt).toLocaleDateString('en-US', {
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : new Date().toLocaleDateString('en-US', {
                                                  month: 'long',
                                                  year: 'numeric',
                                              })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Active Session Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
                    >
                        <h3 className="mb-6 text-2xl font-semibold text-cyan-300">Active Session</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 p-3">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400">Session ID</p>
                                    <p className="text-lg font-semibold break-all text-gray-100">{session.session?.id?.slice(0, 8) || 'N/A'}...</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 p-3">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Session Started</p>
                                    <p className="text-lg font-semibold text-gray-100">
                                        {session.session?.createdAt
                                            ? new Date(session.session.createdAt).toLocaleString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-3">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Expires At</p>
                                    <p className="text-lg font-semibold text-gray-100">
                                        {session.session?.expiresAt
                                            ? new Date(session.session.expiresAt).toLocaleString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 p-3">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-400">User Agent</p>
                                    <p className="truncate text-lg font-semibold text-gray-100">
                                        {session.session?.userAgent
                                            ? session.session.userAgent.length > 50
                                                ? `${session.session.userAgent.slice(0, 50)}...`
                                                : session.session.userAgent
                                            : 'Not available'}
                                    </p>
                                </div>
                            </div>
                            {session.session?.ipAddress && (
                                <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:col-span-2">
                                    <div className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 p-3">
                                        <Globe className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">IP Address</p>
                                        <p className="text-lg font-semibold text-gray-100">{session.session.ipAddress}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
