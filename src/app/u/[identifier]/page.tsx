'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Heart, Lock, Mail, Phone, Pill, QrCode, Stethoscope, User } from 'lucide-react';

import { QRCodeDisplay } from '@/components/QRCodeDisplay';

interface PublicPageData {
    page: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        description: string | null;
        userImage: string | null;
        userName: string | null;
        uniqueKey: string;
    };
    medicines: Array<{
        id: string;
        name: string;
        dosage: string | null;
        frequency: string | null;
    }>;
    allergies: Array<{
        id: string;
        name: string;
        reaction: string | null;
        severity: string;
        isMedicine: boolean;
    }>;
    diagnoses: Array<{
        id: string;
        name: string;
        severity: string | null;
        diagnosisDate: string | null;
        description: string | null;
    }>;
    contacts: Array<{
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        relation: string | null;
    }>;
}

export default function PublicPage() {
    const params = useParams();
    const identifier = params?.identifier as string;
    const [data, setData] = useState<PublicPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        if (!identifier) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/public/${identifier}`);

                if (response.status === 403) {
                    const errorData = await response.json();
                    if (errorData.isPrivate) {
                        setIsPrivate(true);
                        setError('This page is private');
                        return;
                    }
                }

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Page not found');
                    } else {
                        setError('Failed to load page');
                    }
                    return;
                }

                const pageData = await response.json();
                setData(pageData);
            } catch (err) {
                console.error('Error fetching public page:', err);
                setError('An error occurred while loading the page');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [identifier]);

    if (isLoading) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-gray-900">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        className="mb-4 flex justify-center"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <div className="rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-3">
                            <Heart className="h-8 w-8 text-white" fill="white" />
                        </div>
                    </motion.div>
                    <p className="text-lg text-gray-600">Loading...</p>
                </motion.div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-gray-900">
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
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                >
                    <div className="mb-6 flex justify-center">
                        {isPrivate ? (
                            <div className="rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 p-4">
                                <Lock className="h-8 w-8 text-white" />
                            </div>
                        ) : (
                            <div className="rounded-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-4">
                                <AlertTriangle className="h-8 w-8 text-white" />
                            </div>
                        )}
                    </div>
                    <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">{isPrivate ? 'This Page is Private' : 'Page Not Found'}</h2>
                    <p className="mb-6 text-center text-gray-600">
                        {isPrivate
                            ? 'This medical information page has been set to private by its owner. It can only be accessed via the unique link provided by the owner.'
                            : 'The page you are looking for does not exist or has been removed.'}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/"
                            className="cursor-pointer rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40"
                        >
                            Go Home
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    const { page, medicines, allergies, diagnoses, contacts } = data;
    const fullName = [page.firstName, page.lastName].filter(Boolean).join(' ') || page.userName || 'User';

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
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
                        <item.icon className="h-12 w-12 md:h-16 md:w-16" />
                    </motion.div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
                    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900">
                        <Heart className="h-5 w-5" />
                        <span className="font-semibold">Medi Link</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-4xl px-6 pb-12">
                    {/* Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                    >
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            {/* Profile Picture */}
                            <div className="mb-6 md:mr-8 md:mb-0">
                                {page.userImage ? (
                                    <img src={page.userImage} alt={fullName} className="h-32 w-32 rounded-full border-4 border-white shadow-lg" />
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 shadow-lg">
                                        <User className="h-16 w-16 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <h1 className="mb-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                                    {fullName}
                                </h1>
                                {page.description && <p className="mb-4 text-lg text-gray-600">{page.description}</p>}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    {page.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <a href={`mailto:${page.email}`} className="hover:text-cyan-600">
                                                {page.email}
                                            </a>
                                        </div>
                                    )}
                                    {page.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <a href={`tel:${page.phone}`} className="hover:text-cyan-600">
                                                {page.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Medicines Section */}
                    {medicines.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-3 shadow-md">
                                    <Pill className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Current Medications</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {medicines.map((medicine) => (
                                    <div
                                        key={medicine.id}
                                        className="rounded-lg border-2 border-gray-200 bg-white p-5 transition-all hover:border-cyan-300 hover:shadow-md"
                                    >
                                        <h3 className="mb-4 text-lg font-bold text-gray-900">{medicine.name}</h3>
                                        <div className="space-y-3">
                                            {medicine.dosage && (
                                                <div className="flex items-start gap-3 rounded-lg bg-cyan-50 p-3">
                                                    <div className="mt-0.5 rounded-md bg-cyan-100 p-1.5">
                                                        <Pill className="h-4 w-4 text-cyan-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold tracking-wide text-cyan-700 uppercase">Dosage</p>
                                                        <p className="mt-0.5 text-sm font-medium text-gray-900">{medicine.dosage}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {medicine.frequency && (
                                                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                                    <div className="mt-0.5 rounded-md bg-blue-100 p-1.5">
                                                        <Activity className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Frequency</p>
                                                        <p className="mt-0.5 text-sm font-medium text-gray-900">{medicine.frequency}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Allergies Section */}
                    {allergies.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 p-3 shadow-md">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Allergies</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {allergies.map((allergy) => {
                                    // Color coding based on severity
                                    const severityColors = {
                                        'life-threatening': {
                                            border: 'border-red-500',
                                            bg: 'bg-red-50',
                                            text: 'text-red-900',
                                            reactionText: 'text-red-700',
                                            badge: 'bg-red-600 text-white',
                                        },
                                        severe: {
                                            border: 'border-orange-400',
                                            bg: 'bg-orange-50',
                                            text: 'text-orange-900',
                                            reactionText: 'text-orange-700',
                                            badge: 'bg-orange-500 text-white',
                                        },
                                        moderate: {
                                            border: 'border-yellow-400',
                                            bg: 'bg-yellow-50',
                                            text: 'text-yellow-900',
                                            reactionText: 'text-yellow-700',
                                            badge: 'bg-yellow-500 text-white',
                                        },
                                        mild: {
                                            border: 'border-green-400',
                                            bg: 'bg-green-50',
                                            text: 'text-green-900',
                                            reactionText: 'text-green-700',
                                            badge: 'bg-green-500 text-white',
                                        },
                                    };

                                    const colors = severityColors[allergy.severity as keyof typeof severityColors] || severityColors.moderate;

                                    return (
                                        <div
                                            key={allergy.id}
                                            className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className={`font-semibold ${colors.text}`}>{allergy.name}</h3>
                                                {allergy.isMedicine && (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Medicine
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors.badge}`}
                                                >
                                                    {allergy.severity}
                                                </span>
                                            </div>
                                            {allergy.reaction && (
                                                <p className={`text-sm ${colors.reactionText}`}>
                                                    <span className="font-medium">Reaction:</span> {allergy.reaction}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Diagnoses Section */}
                    {diagnoses && diagnoses.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3 shadow-md">
                                    <Stethoscope className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Diagnoses & Conditions</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {diagnoses.map((diagnosis) => {
                                    const severityColors = {
                                        critical: {
                                            border: 'border-red-500',
                                            bg: 'bg-red-50',
                                            text: 'text-red-900',
                                            badge: 'bg-red-600 text-white',
                                        },
                                        severe: {
                                            border: 'border-orange-400',
                                            bg: 'bg-orange-50',
                                            text: 'text-orange-900',
                                            badge: 'bg-orange-500 text-white',
                                        },
                                        moderate: {
                                            border: 'border-yellow-400',
                                            bg: 'bg-yellow-50',
                                            text: 'text-yellow-900',
                                            badge: 'bg-yellow-500 text-white',
                                        },
                                        mild: {
                                            border: 'border-green-400',
                                            bg: 'bg-green-50',
                                            text: 'text-green-900',
                                            badge: 'bg-green-500 text-white',
                                        },
                                    };

                                    const colors = diagnosis.severity
                                        ? severityColors[diagnosis.severity as keyof typeof severityColors] || severityColors.moderate
                                        : {
                                              border: 'border-gray-300',
                                              bg: 'bg-gray-50',
                                              text: 'text-gray-900',
                                              badge: 'bg-gray-500 text-white',
                                          };

                                    return (
                                        <div
                                            key={diagnosis.id}
                                            className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className={`font-semibold ${colors.text}`}>{diagnosis.name}</h3>
                                                {diagnosis.severity && (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors.badge}`}
                                                    >
                                                        {diagnosis.severity}
                                                    </span>
                                                )}
                                            </div>
                                            {diagnosis.diagnosisDate && (
                                                <p className={`mb-2 text-sm ${colors.text}`}>
                                                    <span className="font-medium">Diagnosed:</span>{' '}
                                                    {new Date(diagnosis.diagnosisDate).toLocaleDateString('en-US', { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </p>
                                            )}
                                            {diagnosis.description && (
                                                <p className={`text-sm ${colors.text} opacity-90`}>{diagnosis.description}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Emergency Contacts Section */}
                    {contacts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 p-3 shadow-md">
                                    <Heart className="h-6 w-6 text-white" fill="white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md"
                                    >
                                        <h3 className="mb-2 font-semibold text-gray-900">{contact.name}</h3>
                                        {contact.relation && (
                                            <p className="mb-2 text-sm text-gray-600">
                                                <span className="font-medium">Relation:</span> {contact.relation}
                                            </p>
                                        )}
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    <a href={`tel:${contact.phone}`} className="hover:text-purple-600">
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {contact.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    <a href={`mailto:${contact.email}`} className="hover:text-purple-600">
                                                        {contact.email}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* QR Code Section */}
                    {page.uniqueKey && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 p-3 shadow-md">
                                    <QrCode className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Share This Page</h2>
                            </div>
                            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
                                <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                                    <QRCodeDisplay url={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${page.uniqueKey}`} size={200} />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="mb-4 text-gray-600">Scan this QR code to quickly access this medical information page on any device.</p>
                                    <p className="text-sm text-gray-500">
                                        Share this QR code with healthcare providers, family members, or keep it for emergency access.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {medicines.length === 0 && allergies.length === 0 && (!diagnoses || diagnoses.length === 0) && contacts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-gray-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md"
                        >
                            <p className="text-gray-600">No medical information available yet.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
