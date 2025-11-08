'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, LogOut, Settings, Sparkles, Star, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ViewSwitcher } from '@/components/admin/ViewSwitcher';

interface DashboardHeaderProps {
    userName: string;
    userEmail: string;
    userImage: string | null;
    onSignOut: () => void;
    subscriptionTier?: 'free' | 'basic' | 'pro' | 'premium' | null;
    isAdmin?: boolean;
}

export function DashboardHeader({ userName, userEmail, userImage, onSignOut, subscriptionTier = 'free', isAdmin = false }: DashboardHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        setIsDropdownOpen(false);
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
        <header className="border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
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
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 opacity-50 blur-xl" />
                            <div className="relative rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 p-2">
                                <Heart className="h-5 w-5 text-white" fill="white" />
                            </div>
                        </div>
                    </motion.div>
                    <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-2xl font-bold text-transparent">
                        Medi Link
                    </h1>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                    {isAdmin && <ViewSwitcher isAdmin={isAdmin} />}
                    <div className="hidden items-center gap-3 sm:flex">
                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
                            >
                                {userImage ? (
                                    <img
                                        src={userImage}
                                        alt={userName || 'User'}
                                        className="h-8 w-8 rounded-full border-2 border-gray-200 object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load header profile image:', userImage);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gradient-to-br from-rose-400 to-pink-500">
                                        <span className="text-xs font-semibold text-white">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                    <div className="flex items-center gap-1">
                                        <TierIcon className={`h-3 w-3 ${tierDisplay.color}`} />
                                        <p className={`text-xs ${tierDisplay.color} font-medium`}>{tierDisplay.name}</p>
                                    </div>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
                                    >
                                        <div className="p-2">
                                            <Link
                                                href="/dashboard/account"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                            >
                                                <Settings className="h-4 w-4 text-gray-500" />
                                                <span>Account Settings</span>
                                            </Link>
                                            <div className="my-2 border-t border-gray-200" />
                                            <button
                                                onClick={onSignOut}
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
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
                    <Button
                        onClick={onSignOut}
                        variant="outline"
                        className="cursor-pointer border-2 border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 sm:hidden"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </motion.div>
            </div>
        </header>
    );
}

