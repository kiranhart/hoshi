'use client';

import { motion } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type EntityType } from '@/lib/types';

interface DeleteModalProps {
    isOpen: boolean;
    type: EntityType | null;
    name: string;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteModal({ isOpen, type, name, isDeleting, onClose, onConfirm }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={!isDeleting ? onClose : undefined}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600">
                            {type === 'medicine' && 'Delete Medicine'}
                            {type === 'allergy' && 'Delete Allergy'}
                            {type === 'diagnosis' && 'Delete Diagnosis'}
                            {type === 'contact' && 'Delete Emergency Contact'}
                        </p>
                    </div>
                </div>

                <p className="mb-6 text-gray-700">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{name}"</span>? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        disabled={isDeleting}
                        className="flex-1 cursor-pointer border-2 border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 cursor-pointer bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-rose-600 hover:shadow-xl hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

