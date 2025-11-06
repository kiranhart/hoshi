'use client';

import { motion } from 'framer-motion';
import { Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
    userName: string;
    userEmail: string;
    userImage: string | null;
    onSignOut: () => void;
}

export function DashboardHeader({ userName, userEmail, userImage, onSignOut }: DashboardHeaderProps) {
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
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 opacity-50 blur-xl" />
                            <div className="relative rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 p-2">
                                <Heart className="h-5 w-5 text-white" fill="white" />
                            </div>
                        </div>
                    </motion.div>
                    <h1 className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                        Medi Link
                    </h1>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                    <div className="hidden items-center gap-3 sm:flex">
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
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-gradient-to-br from-teal-400 to-blue-500">
                                <span className="text-xs font-semibold text-white">{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-600">{userEmail}</p>
                        </div>
                    </div>
                    <Button
                        onClick={onSignOut}
                        variant="outline"
                        className="cursor-pointer border-2 border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </motion.div>
            </div>
        </header>
    );
}

