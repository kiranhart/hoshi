'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Heart, Lock, Mail, Phone, Pill, QrCode, Stethoscope, User } from 'lucide-react';

import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { getThemeColors, getColorModeForPage, type PublicPageColorMode } from '@/lib/public-page-themes';

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
        colorMode?: string | null;
        primaryColor?: string | null;
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

    // Get color mode early for loading/error states
    const colorMode = data ? getColorModeForPage(data.page?.colorMode) : 'light';
    const colorsForLoading = getThemeColors(colorMode, data?.page?.primaryColor);

    if (isLoading) {
        return (
            <main className={`relative flex min-h-screen items-center justify-center overflow-hidden ${colorsForLoading.background} ${colorsForLoading.primaryText}`}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        className="mb-4 flex justify-center"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <div className="rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 p-3">
                            <Heart className="h-8 w-8 text-white" fill="white" />
                        </div>
                    </motion.div>
                    <p className={`text-lg ${colorsForLoading.secondaryText}`}>Loading...</p>
                </motion.div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className={`relative flex min-h-screen items-center justify-center overflow-hidden ${colorsForLoading.background} ${colorsForLoading.primaryText}`}>
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
                    className={`relative z-10 w-full max-w-md rounded-2xl border ${colorsForLoading.cardBorder} ${colorsForLoading.cardBackground} p-8 shadow-xl backdrop-blur-md`}
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
                    <h2 className={`mb-4 text-center text-2xl font-bold ${colorsForLoading.headingText}`}>{isPrivate ? 'This Page is Private' : 'Page Not Found'}</h2>
                    <p className={`mb-6 text-center ${colorsForLoading.secondaryText}`}>
                        {isPrivate
                            ? 'This medical information page has been set to private by its owner. It can only be accessed via the unique link provided by the owner.'
                            : 'The page you are looking for does not exist or has been removed.'}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/"
                            className="cursor-pointer rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-rose-500/40"
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
    
    // Get colors with primary color for neobrutalism (reassign with proper typing)
    const themeColors = getThemeColors(colorMode, page.primaryColor);
    const colorsWithExtras = themeColors as typeof themeColors & { _primaryColor?: string; _darkerColor?: string };

    // Use colors with extras for main content
    const colors = colorsWithExtras;
    
    return (
        <main className={`relative min-h-screen overflow-hidden ${colors.background} ${colors.primaryText}`}>
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
                    <Link 
                        href="/" 
                        className={`mb-8 inline-flex items-center gap-2 ${colors.secondaryText} transition-colors ${
                            colorMode === 'neobrutalism' ? 'hover:underline' : colors.linkHover
                        }`}
                        style={colorMode === 'neobrutalism' ? { color: colors._primaryColor } : undefined}
                    >
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
                        className={`mb-8 rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 shadow-xl backdrop-blur-md`}
                    >
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            {/* Profile Picture */}
                            <div className="mb-6 md:mr-8 md:mb-0">
                                {page.userImage ? (
                                    <img src={page.userImage} alt={fullName} className={`h-32 w-32 rounded-full border-4 ${colors.profileImageBorder} shadow-lg`} />
                                ) : (
                                    <div 
                                        className={`flex h-32 w-32 items-center justify-center rounded-full shadow-lg ${
                                            colorMode === 'neobrutalism' ? '' : `bg-gradient-to-br ${colors.iconBackground}`
                                        }`}
                                        style={colorMode === 'neobrutalism' ? { backgroundColor: colors._primaryColor } : undefined}
                                    >
                                        <User className={`h-16 w-16 ${colors.iconColor}`} />
                                    </div>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <h1 
                                    className={`mb-2 text-4xl font-bold ${
                                        colorMode === 'neobrutalism' 
                                            ? '' 
                                            : `bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent`
                                    }`}
                                    style={colorMode === 'neobrutalism' ? { color: colors._primaryColor } : undefined}
                                >
                                    {fullName}
                                </h1>
                                {page.description && <p className={`mb-4 text-lg ${colors.secondaryText}`}>{page.description}</p>}
                                <div className={`flex flex-wrap gap-4 text-sm ${colors.secondaryText}`}>
                                    {page.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <a 
                                                href={`mailto:${page.email}`} 
                                                className={colorMode === 'neobrutalism' ? 'hover:underline' : colors.linkHover}
                                                style={colorMode === 'neobrutalism' ? { color: colors._primaryColor } : undefined}
                                            >
                                                {page.email}
                                            </a>
                                        </div>
                                    )}
                                    {page.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <a 
                                                href={`tel:${page.phone}`} 
                                                className={colorMode === 'neobrutalism' ? 'hover:underline' : colors.linkHover}
                                                style={colorMode === 'neobrutalism' ? { color: colors._primaryColor } : undefined}
                                            >
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
                            className={`mb-8 rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 shadow-xl backdrop-blur-md`}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div 
                                    className={`rounded-xl p-3 shadow-md ${
                                        colorMode === 'neobrutalism' ? '' : `bg-gradient-to-br ${colors.iconBackground}`
                                    }`}
                                    style={colorMode === 'neobrutalism' ? { backgroundColor: colors._primaryColor } : undefined}
                                >
                                    <Pill className={`h-6 w-6 ${colors.iconColor}`} />
                                </div>
                                <h2 className={`text-2xl font-bold ${colors.headingText}`}>Current Medications</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {medicines.map((medicine) => (
                                    <div
                                        key={medicine.id}
                                        className={`rounded-lg border-2 ${colors.cardBorder} ${colors.cardBackground} p-5 transition-all hover:shadow-md`}
                                    >
                                        <h3 className={`mb-4 text-lg font-bold ${colors.headingText}`}>{medicine.name}</h3>
                                        <div className="space-y-3">
                                            {medicine.dosage && (
                                                <div className={`flex items-start gap-3 rounded-lg ${colors.medicineDosageBg} p-3`}>
                                                    <div className={`mt-0.5 rounded-md ${colors.medicineDosageIconBg} p-1.5`}>
                                                        <Pill className={`h-4 w-4 ${colors.medicineDosageIconColor}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-semibold tracking-wide ${colors.medicineDosageLabel} uppercase`}>Dosage</p>
                                                        <p className={`mt-0.5 text-sm font-medium ${colors.primaryText}`}>{medicine.dosage}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {medicine.frequency && (
                                                <div className={`flex items-start gap-3 rounded-lg ${colors.medicineFrequencyBg} p-3`}>
                                                    <div className={`mt-0.5 rounded-md ${colors.medicineFrequencyIconBg} p-1.5`}>
                                                        <Activity className={`h-4 w-4 ${colors.medicineFrequencyIconColor}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-semibold tracking-wide ${colors.medicineFrequencyLabel} uppercase`}>Frequency</p>
                                                        <p className={`mt-0.5 text-sm font-medium ${colors.primaryText}`}>{medicine.frequency}</p>
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
                            className={`mb-8 rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 shadow-xl backdrop-blur-md`}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div 
                                    className={`rounded-xl p-3 shadow-md ${
                                        colorMode === 'neobrutalism' ? '' : `bg-gradient-to-br ${colors.iconBackground}`
                                    }`}
                                    style={colorMode === 'neobrutalism' ? { backgroundColor: colors._primaryColor } : undefined}
                                >
                                    <AlertTriangle className={`h-6 w-6 ${colors.iconColor}`} />
                                </div>
                                <h2 className={`text-2xl font-bold ${colors.headingText}`}>Allergies</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {allergies.map((allergy) => {
                                    // Color coding based on severity - theme-aware
                                    const getSeverityColors = (severity: string) => {
                                        const isDark = colorMode === 'dark';
                                        const baseColors = {
                                            'life-threatening': {
                                                border: isDark ? 'border-red-400' : 'border-red-500',
                                                bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
                                                text: isDark ? 'text-red-100' : 'text-red-900',
                                                reactionText: isDark ? 'text-red-200' : 'text-red-700',
                                                badge: isDark ? 'bg-red-600 text-white' : 'bg-red-600 text-white',
                                            },
                                            severe: {
                                                border: isDark ? 'border-orange-400' : 'border-orange-400',
                                                bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
                                                text: isDark ? 'text-orange-100' : 'text-orange-900',
                                                reactionText: isDark ? 'text-orange-200' : 'text-orange-700',
                                                badge: isDark ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white',
                                            },
                                            moderate: {
                                                border: isDark ? 'border-yellow-400' : 'border-yellow-400',
                                                bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50',
                                                text: isDark ? 'text-yellow-100' : 'text-yellow-900',
                                                reactionText: isDark ? 'text-yellow-200' : 'text-yellow-700',
                                                badge: isDark ? 'bg-yellow-500 text-white' : 'bg-yellow-500 text-white',
                                            },
                                            mild: {
                                                border: isDark ? 'border-green-400' : 'border-green-400',
                                                bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
                                                text: isDark ? 'text-green-100' : 'text-green-900',
                                                reactionText: isDark ? 'text-green-200' : 'text-green-700',
                                                badge: isDark ? 'bg-green-500 text-white' : 'bg-green-500 text-white',
                                            },
                                        };
                                        return baseColors[severity as keyof typeof baseColors] || baseColors.moderate;
                                    };

                                    const severityColors = getSeverityColors(allergy.severity);

                                    return (
                                        <div
                                            key={allergy.id}
                                            className={`rounded-lg border-2 ${severityColors.border} ${severityColors.bg} p-4 transition-all hover:shadow-md`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className={`font-semibold ${severityColors.text}`}>{allergy.name}</h3>
                                                {allergy.isMedicine && (
                                                    <span className={`inline-flex items-center rounded-full ${colorMode === 'dark' ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'} px-2 py-0.5 text-xs font-medium`}>
                                                        Medicine
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${severityColors.badge}`}
                                                >
                                                    {allergy.severity}
                                                </span>
                                            </div>
                                            {allergy.reaction && (
                                                <p className={`text-sm ${severityColors.reactionText}`}>
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
                            className={`mb-8 rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 shadow-xl backdrop-blur-md`}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div 
                                    className={`rounded-xl p-3 shadow-md ${
                                        colorMode === 'neobrutalism' ? '' : `bg-gradient-to-br ${colors.iconBackground}`
                                    }`}
                                    style={colorMode === 'neobrutalism' ? { backgroundColor: colors._primaryColor } : undefined}
                                >
                                    <Stethoscope className={`h-6 w-6 ${colors.iconColor}`} />
                                </div>
                                <h2 className={`text-2xl font-bold ${colors.headingText}`}>Diagnoses & Conditions</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {diagnoses.map((diagnosis) => {
                                    const getSeverityColors = (severity: string | null) => {
                                        if (!severity) {
                                            return {
                                                border: colorMode === 'dark' ? 'border-gray-600' : 'border-gray-300',
                                                bg: colorMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50',
                                                text: colorMode === 'dark' ? 'text-gray-200' : 'text-gray-900',
                                                badge: 'bg-gray-500 text-white',
                                            };
                                        }
                                        const isDark = colorMode === 'dark';
                                        const baseColors = {
                                            critical: {
                                                border: isDark ? 'border-red-400' : 'border-red-500',
                                                bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
                                                text: isDark ? 'text-red-100' : 'text-red-900',
                                                badge: 'bg-red-600 text-white',
                                            },
                                            severe: {
                                                border: isDark ? 'border-orange-400' : 'border-orange-400',
                                                bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
                                                text: isDark ? 'text-orange-100' : 'text-orange-900',
                                                badge: 'bg-orange-500 text-white',
                                            },
                                            moderate: {
                                                border: isDark ? 'border-yellow-400' : 'border-yellow-400',
                                                bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50',
                                                text: isDark ? 'text-yellow-100' : 'text-yellow-900',
                                                badge: 'bg-yellow-500 text-white',
                                            },
                                            mild: {
                                                border: isDark ? 'border-green-400' : 'border-green-400',
                                                bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
                                                text: isDark ? 'text-green-100' : 'text-green-900',
                                                badge: 'bg-green-500 text-white',
                                            },
                                        };
                                        return baseColors[severity as keyof typeof baseColors] || baseColors.moderate;
                                    };

                                    const severityColors = getSeverityColors(diagnosis.severity);

                                    return (
                                        <div
                                            key={diagnosis.id}
                                            className={`rounded-lg border-2 ${severityColors.border} ${severityColors.bg} p-4 transition-all hover:shadow-md`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className={`font-semibold ${severityColors.text}`}>{diagnosis.name}</h3>
                                                {diagnosis.severity && (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${severityColors.badge}`}
                                                    >
                                                        {diagnosis.severity}
                                                    </span>
                                                )}
                                            </div>
                                            {diagnosis.diagnosisDate && (
                                                <p className={`mb-2 text-sm ${severityColors.text}`}>
                                                    <span className="font-medium">Diagnosed:</span>{' '}
                                                    {new Date(diagnosis.diagnosisDate).toLocaleDateString('en-US', { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </p>
                                            )}
                                            {diagnosis.description && (
                                                <p className={`text-sm ${severityColors.text} opacity-90`}>{diagnosis.description}</p>
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
                            className={`mb-8 rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 shadow-xl backdrop-blur-md`}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div 
                                    className={`rounded-xl p-3 shadow-md ${
                                        colorMode === 'neobrutalism' ? '' : `bg-gradient-to-br ${colors.iconBackground}`
                                    }`}
                                    style={colorMode === 'neobrutalism' ? { backgroundColor: colors._primaryColor } : undefined}
                                >
                                    <Heart className={`h-6 w-6 ${colors.iconColor}`} fill="currentColor" />
                                </div>
                                <h2 className={`text-2xl font-bold ${colors.headingText}`}>Emergency Contacts</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`rounded-lg border-2 ${colors.cardBorder} ${colors.cardBackground} p-4 transition-all hover:shadow-md`}
                                    >
                                        <h3 className={`mb-2 font-semibold ${colors.headingText}`}>{contact.name}</h3>
                                        {contact.relation && (
                                            <p className={`mb-2 text-sm ${colors.secondaryText}`}>
                                                <span className="font-medium">Relation:</span> {contact.relation}
                                            </p>
                                        )}
                                        <div className={`space-y-1 text-sm ${colors.secondaryText}`}>
                                            {contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    <a 
                                                        href={`tel:${contact.phone}`} 
                                                        className={colorMode === 'neobrutalism' ? 'hover:underline' : colors.linkHover}
                                                        style={colorMode === 'neobrutalism' ? { color: colors._primaryColor } : undefined}
                                                    >
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {contact.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    <a 
                                                        href={`mailto:${contact.email}`} 
                                                        className={colorMode === 'neobrutalism' ? 'hover:underline' : colors.linkHover}
                                                        style={colorMode === 'neobrutalism' ? { color: colors._primaryColor } : undefined}
                                                    >
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
                            className={`mb-8 rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 shadow-xl backdrop-blur-md`}
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className={`rounded-xl bg-gradient-to-br ${colors.iconBackground} p-3 shadow-md`}>
                                    <QrCode className={`h-6 w-6 ${colors.iconColor}`} />
                                </div>
                                <h2 className={`text-2xl font-bold ${colors.headingText}`}>Share This Page</h2>
                            </div>
                            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
                                    <div className={`rounded-lg border-2 ${colors.cardBorder} ${colors.cardBackground} p-4`}>
                                    <QRCodeDisplay url={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${page.uniqueKey}`} size={200} />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className={`mb-4 ${colors.secondaryText}`}>Scan this QR code to quickly access this medical information page on any device.</p>
                                    <p className={`text-sm ${colors.secondaryText} opacity-80`}>
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
                            className={`rounded-2xl border ${colors.cardBorder} ${colors.cardBackground} p-8 text-center shadow-xl backdrop-blur-md`}
                        >
                            <p className={colors.secondaryText}>No medical information available yet.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
