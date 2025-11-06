'use client';

import Link from 'next/link';
import { useState } from 'react';

import { motion } from 'framer-motion';
import { Activity, Heart, Pill, Search, Shield, Stethoscope, UserPlus } from 'lucide-react';

export default function Home() {
    const [username, setUsername] = useState('');

    const handleUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            // Redirect to sign-in with username as query param
            window.location.href = `/sign-in?username=${encodeURIComponent(username.trim())}`;
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-gray-900">
            {/* Animated Gradient Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-teal-400/40 via-cyan-400/40 to-blue-500/40 blur-3xl"
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
                    className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-gradient-to-r from-pink-400/40 via-purple-400/40 to-indigo-500/40 blur-3xl"
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
                    className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 blur-3xl"
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
                    { icon: Heart, x: '10%', y: '20%', delay: 0, color: 'text-pink-200' },
                    { icon: Pill, x: '85%', y: '15%', delay: 0.3, color: 'text-cyan-200' },
                    { icon: Stethoscope, x: '15%', y: '70%', delay: 0.6, color: 'text-emerald-200' },
                    { icon: Activity, x: '90%', y: '75%', delay: 0.9, color: 'text-purple-200' },
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
                        <item.icon className="h-16 w-16 md:h-24 md:w-24" />
                    </motion.div>
                ))}
            </div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 px-6 pt-16 text-center md:pt-24"
            >
                {/* Logo/Icon */}
                <motion.div
                    className="mb-8 flex justify-center"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 opacity-50 blur-xl" />
                        <div className="relative rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-4">
                            <Heart className="h-12 w-12 text-white md:h-16 md:w-16" fill="white" />
                        </div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="mb-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-6xl font-extrabold text-transparent md:text-7xl lg:text-8xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Medi Link
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="mx-auto mb-12 max-w-2xl text-xl text-gray-600 md:text-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Your medical information, one link away. Share medications, allergies, emergency contacts, and more.
                </motion.p>

                {/* Username Search */}
                <motion.form
                    onSubmit={handleUsernameSubmit}
                    className="mx-auto mb-8 flex max-w-md flex-col gap-4 sm:flex-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for a username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-full border-2 border-gray-200 bg-white px-12 py-4 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="cursor-pointer rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40 active:scale-95"
                    >
                        Search
                    </button>
                </motion.form>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <Link href="/sign-in">
                        <button className="group flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95">
                            <UserPlus className="h-5 w-5" />
                            Get Started
                        </button>
                    </Link>
                    <Link href="/sign-in">
                        <button className="cursor-pointer rounded-full border-2 border-gray-300 bg-white px-8 py-4 font-semibold text-gray-700 shadow-sm transition-all hover:scale-105 hover:border-gray-400 hover:bg-gray-50 active:scale-95">
                            Sign In
                        </button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Features Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                viewport={{ once: true }}
                className="relative z-10 mt-32 grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                {[
                    {
                        icon: Pill,
                        title: 'Medications',
                        desc: 'Track and share your current medications with healthcare providers',
                        gradient: 'from-cyan-400 to-blue-500',
                    },
                    {
                        icon: Activity,
                        title: 'Allergies',
                        desc: 'Keep your allergies visible for quick access in emergencies',
                        gradient: 'from-pink-400 to-rose-500',
                    },
                    {
                        icon: Heart,
                        title: 'Emergency Contacts',
                        desc: 'Store important contacts for medical emergencies',
                        gradient: 'from-purple-400 to-indigo-500',
                    },
                    {
                        icon: Shield,
                        title: 'Secure & Private',
                        desc: 'Your medical data is encrypted and secure',
                        gradient: 'from-emerald-400 to-teal-500',
                    },
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:scale-105"
                    >
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-5`}
                        />
                        <div className="absolute inset-0 rounded-2xl border border-gray-200 transition-colors duration-200 group-hover:border-gray-300" />
                        <div className="relative">
                            <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-md`}>
                                <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.section>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative z-10 mt-32 mb-10 text-center text-sm text-gray-500"
            >
                <p>
                    Made with <span className="text-pink-500">❤️</span> for better healthcare • © {new Date().getFullYear()} Medi Link
                </p>
            </motion.footer>
        </main>
    );
}
