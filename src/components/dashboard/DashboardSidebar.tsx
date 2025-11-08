'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, LayoutDashboard, Menu, Phone, Pill, QrCode, Stethoscope, X } from 'lucide-react';

export type DashboardSection = 'overview' | 'page-info' | 'medicines' | 'allergies' | 'diagnosis' | 'contacts' | 'qr-code';

interface DashboardSidebarProps {
    activeSection: DashboardSection;
    onSectionChange: (section: DashboardSection) => void;
    isMobileOpen: boolean;
    onMobileToggle: () => void;
}

const navigationItems: Array<{ id: DashboardSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'page-info', label: 'Page Information', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
    { id: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
    { id: 'qr-code', label: 'QR Code', icon: QrCode },
];

export function DashboardSidebar({ activeSection, onSectionChange, isMobileOpen, onMobileToggle }: DashboardSidebarProps) {
    const handleSectionClick = (section: DashboardSection) => {
        onSectionChange(section);
        // Close mobile menu after selection
        if (isMobileOpen) {
            onMobileToggle();
        }
    };

    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Logo/Header */}
            <div className="border-b border-gray-200/80 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-transparent p-5 dark:border-gray-700/80 dark:from-rose-950/50 dark:via-pink-950/30">
                <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-2 shadow-lg shadow-rose-500/30">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-lg font-bold text-transparent dark:from-rose-400 dark:via-pink-400 dark:to-rose-500">
                            Dashboard
                        </h2>
                        <p className="mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">Manage your profile</p>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 pb-6">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleSectionClick(item.id)}
                            className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                                isActive
                                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-lg shadow-rose-500/40'
                                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-gray-900 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50 dark:hover:text-gray-100'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSection"
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={`relative z-10 rounded-lg p-1.5 transition-all ${
                                isActive 
                                    ? 'bg-white/20' 
                                    : 'bg-gray-100 group-hover:bg-rose-100 dark:bg-gray-700 dark:group-hover:bg-rose-900/50'
                            }`}>
                                <Icon
                                    className={`h-4 w-4 transition-all ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-gray-500 group-hover:text-rose-600 dark:text-gray-400 dark:group-hover:text-rose-400'
                                    }`}
                                />
                            </div>
                            <span className={`relative z-10 font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button - Now integrated into header, so this is removed */}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 lg:block">
                <div className="flex h-full flex-col border-r border-gray-200/80 bg-gradient-to-b from-white via-white to-gray-50/50 shadow-xl backdrop-blur-md dark:border-gray-700/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50">
                    {sidebarContent}
                </div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onMobileToggle}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 z-50 h-full w-80 border-r border-gray-200/80 bg-gradient-to-b from-white via-white to-gray-50/50 shadow-2xl backdrop-blur-md dark:border-gray-700/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 lg:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

