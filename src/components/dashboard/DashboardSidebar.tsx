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
        <div className="flex flex-col">
            {/* Logo/Header */}
            <div className="border-b border-gray-200 bg-white p-4">
                <h2 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-lg font-bold text-transparent">
                    Dashboard
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">Manage your profile</p>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-0.5 p-3 pb-4">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleSectionClick(item.id)}
                            className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSection"
                                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon
                                className={`relative z-10 h-5 w-5 transition-transform group-hover:scale-110 ${
                                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-rose-500'
                                }`}
                            />
                            <span className={`relative z-10 font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
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
            {/* Mobile Menu Button */}
            <button
                onClick={onMobileToggle}
                className="fixed left-4 top-24 z-50 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg transition-all hover:bg-gray-50 lg:hidden"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
            </button>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:w-56 lg:flex-shrink-0">
                <div className="sticky top-4 h-fit rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg">
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
                            className="fixed left-0 top-0 z-50 h-full w-80 border-r border-gray-200 bg-white shadow-2xl lg:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

