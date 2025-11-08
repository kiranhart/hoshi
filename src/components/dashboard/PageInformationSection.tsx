'use client';

import { motion } from 'framer-motion';
import { Lock, Moon, Palette, QrCode, Sun, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type PublicPageColorMode } from '@/lib/public-page-themes';

interface PageInformationSectionProps {
    pageForm: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        description: string;
        isPrivate: boolean;
        colorMode: PublicPageColorMode;
        primaryColor: string;
    };
    pageData: { uniqueKey?: string } | null;
    isSavingPage: boolean;
    onFormChange: (field: string, value: string | boolean) => void;
    onSave: () => void;
}

export function PageInformationSection({
    pageForm,
    pageData,
    isSavingPage,
    onFormChange,
    onSave,
}: PageInformationSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80"
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Page Information</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {pageForm.isPrivate ? <Lock className="h-5 w-5 text-amber-500 dark:text-amber-400" /> : <Unlock className="h-5 w-5 text-green-500 dark:text-green-400" />}
                        <span className="text-sm text-gray-600 dark:text-gray-300">{pageForm.isPrivate ? 'Private' : 'Public'}</span>
                    </div>
                    <Button
                        onClick={onSave}
                        disabled={isSavingPage}
                        className="cursor-pointer bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 hover:shadow-xl hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSavingPage ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    <input
                        type="text"
                        value={pageForm.firstName}
                        onChange={(e) => onFormChange('firstName', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    <input
                        type="text"
                        value={pageForm.lastName}
                        onChange={(e) => onFormChange('lastName', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                        placeholder="Doe"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        value={pageForm.email}
                        onChange={(e) => onFormChange('email', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <input
                        type="tel"
                        value={pageForm.phone}
                        onChange={(e) => onFormChange('phone', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                        placeholder="+1 (555) 123-4567"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        value={pageForm.description}
                        onChange={(e) => onFormChange('description', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                        placeholder="A brief description about yourself..."
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Page Color Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => onFormChange('colorMode', 'light')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                pageForm.colorMode === 'light'
                                    ? 'border-rose-500 bg-rose-50 shadow-md dark:border-rose-400 dark:bg-rose-950/50'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                            }`}
                        >
                            <Sun className={`h-5 w-5 ${pageForm.colorMode === 'light' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            <span className={`text-sm font-semibold ${pageForm.colorMode === 'light' ? 'text-rose-900 dark:text-rose-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                Light
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onFormChange('colorMode', 'dark')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                pageForm.colorMode === 'dark'
                                    ? 'border-rose-500 bg-rose-50 shadow-md dark:border-rose-400 dark:bg-rose-950/50'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                            }`}
                        >
                            <Moon className={`h-5 w-5 ${pageForm.colorMode === 'dark' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            <span className={`text-sm font-semibold ${pageForm.colorMode === 'dark' ? 'text-rose-900 dark:text-rose-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                Dark
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onFormChange('colorMode', 'neobrutalism')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                pageForm.colorMode === 'neobrutalism'
                                    ? 'border-rose-500 bg-rose-50 shadow-md dark:border-rose-400 dark:bg-rose-950/50'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                            }`}
                        >
                            <Palette className={`h-5 w-5 ${pageForm.colorMode === 'neobrutalism' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            <span className={`text-sm font-semibold ${pageForm.colorMode === 'neobrutalism' ? 'text-rose-900 dark:text-rose-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                Neobrutalism
                            </span>
                        </button>
                    </div>
                </div>
                {pageForm.colorMode === 'neobrutalism' && (
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={pageForm.primaryColor}
                                onChange={(e) => onFormChange('primaryColor', e.target.value)}
                                className="h-12 w-24 cursor-pointer rounded-lg border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                            />
                            <input
                                type="text"
                                value={pageForm.primaryColor}
                                onChange={(e) => onFormChange('primaryColor', e.target.value)}
                                placeholder="#FF6B6B"
                                className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Choose a primary color for your neobrutalism theme. Make sure it has good contrast for readability.
                        </p>
                    </div>
                )}
                <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={pageForm.isPrivate}
                            onChange={(e) => onFormChange('isPrivate', e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400/20 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Make page private (QR code access only)</span>
                    </label>
                </div>
                {pageData?.uniqueKey && (
                    <div className="rounded-lg border-2 border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-950/50 md:col-span-2">
                        <div className="mb-2 flex items-center gap-3">
                            <QrCode className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">QR Code Key</span>
                        </div>
                        <p className="mb-2 text-xs text-gray-600 dark:text-gray-300">Use this key to access your private page via QR code:</p>
                        <code className="block rounded border border-gray-200 bg-white p-2 text-sm break-all text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                            {pageData.uniqueKey}
                        </code>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

