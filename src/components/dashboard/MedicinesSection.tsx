'use client';

import { motion } from 'framer-motion';
import { Check, Edit2, Loader2, Pill, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Medicine {
    id: string;
    name: string;
    dosage: string | null;
    frequency: string | null;
}

interface MedicinesSectionProps {
    medicines: Medicine[];
    newMedicine: { name: string; dosage: string; frequency: string };
    editingMedicine: string | null;
    editingMedicineData: { name: string; dosage: string; frequency: string } | null;
    isAddingMedicine: boolean;
    onNewMedicineChange: (field: string, value: string) => void;
    onAddMedicine: () => void;
    onEditStart: (medicine: Medicine) => void;
    onEditCancel: () => void;
    onEditChange: (field: string, value: string) => void;
    onEditSave: (id: string) => void;
    onDelete: (id: string, name: string) => void;
}

export function MedicinesSection({
    medicines,
    newMedicine,
    editingMedicine,
    editingMedicineData,
    isAddingMedicine,
    onNewMedicineChange,
    onAddMedicine,
    onEditStart,
    onEditCancel,
    onEditChange,
    onEditSave,
    onDelete,
}: MedicinesSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-2 shadow-md">
                    <Pill className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Medicines</h3>
            </div>

            {/* Add Medicine Form */}
            <div className="mb-6 grid gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 md:grid-cols-4">
                <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => onNewMedicineChange('name', e.target.value)}
                    placeholder="Medicine name"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => onNewMedicineChange('dosage', e.target.value)}
                    placeholder="Dosage"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <input
                    type="text"
                    value={newMedicine.frequency}
                    onChange={(e) => onNewMedicineChange('frequency', e.target.value)}
                    placeholder="Frequency"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <Button
                    onClick={onAddMedicine}
                    disabled={isAddingMedicine}
                    className="cursor-pointer bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isAddingMedicine ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add
                        </>
                    )}
                </Button>
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
                {medicines.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">No medicines added yet.</p>
                ) : (
                    medicines.map((medicine) => (
                        <div key={medicine.id} className="flex items-center gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm">
                            {editingMedicine === medicine.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingMedicineData?.name || ''}
                                        onChange={(e) => onEditChange('name', e.target.value)}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={editingMedicineData?.dosage || ''}
                                        onChange={(e) => onEditChange('dosage', e.target.value)}
                                        placeholder="Dosage"
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={editingMedicineData?.frequency || ''}
                                        onChange={(e) => onEditChange('frequency', e.target.value)}
                                        placeholder="Frequency"
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    />
                                    <Button
                                        onClick={() => onEditSave(medicine.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-green-500 hover:bg-green-50 hover:text-green-600"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={onEditCancel}
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <p className="mb-2 font-semibold text-gray-900">{medicine.name}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {medicine.dosage && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                                                    <span className="text-cyan-500">💊</span>
                                                    <span className="font-semibold">Dosage:</span>
                                                    <span>{medicine.dosage}</span>
                                                </span>
                                            )}
                                            {medicine.frequency && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                    <span className="text-blue-500">⏰</span>
                                                    <span className="font-semibold">Frequency:</span>
                                                    <span>{medicine.frequency}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onEditStart(medicine)}
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-gray-400 hover:text-cyan-500"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(medicine.id, medicine.name)}
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

