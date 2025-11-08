'use client';

import { motion } from 'framer-motion';
import { Lock, QrCode, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageInformationSectionProps {
    pageForm: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        description: string;
        isPrivate: boolean;
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
            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Page Information</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {pageForm.isPrivate ? <Lock className="h-5 w-5 text-amber-500" /> : <Unlock className="h-5 w-5 text-green-500" />}
                        <span className="text-sm text-gray-600">{pageForm.isPrivate ? 'Private' : 'Public'}</span>
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
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        value={pageForm.firstName}
                        onChange={(e) => onFormChange('firstName', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        type="text"
                        value={pageForm.lastName}
                        onChange={(e) => onFormChange('lastName', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        placeholder="Doe"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={pageForm.email}
                        onChange={(e) => onFormChange('email', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        value={pageForm.phone}
                        onChange={(e) => onFormChange('phone', e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        placeholder="+1 (555) 123-4567"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={pageForm.description}
                        onChange={(e) => onFormChange('description', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        placeholder="A brief description about yourself..."
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={pageForm.isPrivate}
                            onChange={(e) => onFormChange('isPrivate', e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400/20"
                        />
                        <span className="text-sm text-gray-700">Make page private (QR code access only)</span>
                    </label>
                </div>
                {pageData?.uniqueKey && (
                    <div className="rounded-lg border-2 border-cyan-200 bg-cyan-50 p-4 md:col-span-2">
                        <div className="mb-2 flex items-center gap-3">
                            <QrCode className="h-5 w-5 text-cyan-600" />
                            <span className="text-sm font-medium text-cyan-700">QR Code Key</span>
                        </div>
                        <p className="mb-2 text-xs text-gray-600">Use this key to access your private page via QR code:</p>
                        <code className="block rounded border border-gray-200 bg-white p-2 text-sm break-all text-gray-900">
                            {pageData.uniqueKey}
                        </code>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

