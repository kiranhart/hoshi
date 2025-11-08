'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Heart, LogOut, Menu, Package, Settings, ShoppingCart, Sparkles, Star, X, Zap } from 'lucide-react';

import { DarkModeToggle } from '@/components/dark-mode-toggle';
import { Button } from '@/components/ui/button';
import { ViewSwitcher } from '@/components/admin/ViewSwitcher';

interface DashboardHeaderProps {
    userName: string;
    userEmail: string;
    userImage: string | null;
    onSignOut: () => void;
    subscriptionTier?: 'free' | 'basic' | 'pro' | 'premium' | null;
    isAdmin?: boolean;
    onMobileMenuToggle?: () => void;
    isMobileMenuOpen?: boolean;
    unreadNotificationCount?: number;
}

export function DashboardHeader({ userName, userEmail, userImage, onSignOut, subscriptionTier = 'free', isAdmin = false, onMobileMenuToggle, isMobileMenuOpen = false, unreadNotificationCount = 0 }: DashboardHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationDropdownOpen(false);
            }
        };

        if (isDropdownOpen || isNotificationDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, isNotificationDropdownOpen]);

    useEffect(() => {
        setIsDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
    }, [pathname]);

    const getTierDisplay = () => {
        switch (subscriptionTier) {
            case 'free':
                return { name: 'Free', icon: Star, color: 'text-gray-500' };
            case 'basic':
                return { name: 'Basic', icon: Zap, color: 'text-rose-500' };
            case 'pro':
                return { name: 'Pro', icon: Sparkles, color: 'text-pink-500' };
            case 'premium':
                return { name: 'Premium', icon: Sparkles, color: 'text-rose-600' };
            default:
                return { name: 'Free', icon: Star, color: 'text-gray-500' };
        }
    };

    const tierDisplay = getTierDisplay();
    const TierIcon = tierDisplay.icon;

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-gradient-to-r from-white via-white to-rose-50/30 shadow-sm backdrop-blur-md dark:border-gray-800/80 dark:from-gray-900 dark:via-gray-900 dark:to-rose-950/30">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:pl-64">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Menu Button */}
                        {onMobileMenuToggle && (
                            <button
                                onClick={onMobileMenuToggle}
                                className="mr-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 lg:hidden"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                ) : (
                                    <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                )}
                            </button>
                        )}
                        <motion.div
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
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 opacity-50 blur-xl" />
                                <div className="relative rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-1.5 sm:p-2.5 shadow-lg shadow-rose-500/30">
                                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="white" />
                                </div>
                            </div>
                        </motion.div>
                        <div>
                            <h1 className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-lg sm:text-2xl font-bold text-transparent dark:from-rose-400 dark:via-pink-400 dark:to-rose-500">
                                Medi Link
                            </h1>
                            <p className="hidden text-xs font-medium text-gray-500 dark:text-gray-400 sm:block">Medical Profile Manager</p>
                        </div>
                    </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 sm:gap-4">
                    {isAdmin && <ViewSwitcher isAdmin={isAdmin} />}
                    <div className="hidden items-center gap-3 md:flex">
                        {/* Dark Mode Toggle */}
                        <DarkModeToggle />
                        
                        {/* Notifications */}
                        <div className="relative" ref={notificationDropdownRef}>
                            <Link
                                href="/dashboard/notifications"
                                className="relative flex items-center justify-center rounded-xl p-2 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50"
                            >
                                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:shadow-sm dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50"
                            >
                                {userImage ? (
                                    <img
                                        src={userImage}
                                        alt={userName || 'User'}
                                        className="h-9 w-9 rounded-xl border-2 border-rose-200 object-cover shadow-sm dark:border-rose-800"
                                        onError={(e) => {
                                            console.error('Failed to load header profile image:', userImage);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 shadow-sm dark:border-rose-800">
                                        <span className="text-xs font-bold text-white">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{userName}</p>
                                    <div className="flex items-center gap-1">
                                        <TierIcon className={`h-3 w-3 ${tierDisplay.color}`} />
                                        <p className={`text-xs ${tierDisplay.color} font-medium`}>{tierDisplay.name}</p>
                                    </div>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full z-[9999] mt-2 w-64 rounded-xl border border-gray-200/80 bg-white/95 shadow-xl backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95"
                                    >
                                        <div className="p-2">
                                            <Link
                                                href="/dashboard/account"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50 dark:hover:text-rose-400"
                                            >
                                                <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span>Account Settings</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/shop"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50 dark:hover:text-rose-400"
                                            >
                                                <ShoppingCart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span>Shop</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/orders"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50 dark:hover:text-rose-400"
                                            >
                                                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span>My Orders</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/notifications"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50 dark:hover:text-rose-400"
                                            >
                                                <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span>Notifications</span>
                                                {unreadNotificationCount > 0 && (
                                                    <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                                                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                                    </span>
                                                )}
                                            </Link>
                                            <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                                            <button
                                                onClick={onSignOut}
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-gradient-to-r hover:from-red-50 hover:via-rose-50 hover:to-red-50 dark:text-red-400 dark:hover:from-red-950/50 dark:hover:via-rose-950/50 dark:hover:to-red-950/50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    {/* Mobile: Dark mode toggle and sign out button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <DarkModeToggle />
                        <Button
                            onClick={onSignOut}
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer rounded-xl text-gray-600 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50"
                            aria-label="Sign out"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </header>
    );
}

