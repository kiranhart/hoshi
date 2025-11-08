'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Loader2, Pill, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from './AutocompleteInput';
import { COMMON_MEDICINES } from '@/lib/medical-data';
import { type Medicine } from '@/lib/types';

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

const DOSAGE_OPTIONS = [
    { value: 'mg', label: 'mg (milligrams)' },
    { value: 'g', label: 'g (grams)' },
    { value: 'ml', label: 'ml (milliliters)' },
    { value: 'units', label: 'units' },
    { value: 'tablets', label: 'tablets' },
    { value: 'capsules', label: 'capsules' },
    { value: 'drops', label: 'drops' },
    { value: 'other', label: 'Other (custom)' },
];

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice daily', label: 'Twice daily' },
    { value: '3 times a day', label: '3 times a day' },
    { value: '4 times a day', label: '4 times a day' },
    { value: 'every 12 hours', label: 'Every 12 hours' },
    { value: 'every 8 hours', label: 'Every 8 hours' },
    { value: 'every 6 hours', label: 'Every 6 hours' },
    { value: 'as needed', label: 'As needed' },
    { value: 'other', label: 'Other (custom)' },
];

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
    const [dosageType, setDosageType] = useState<'preset' | 'custom'>('preset');
    const [frequencyType, setFrequencyType] = useState<'preset' | 'custom'>('preset');
    const [editingDosageType, setEditingDosageType] = useState<'preset' | 'custom'>('preset');
    const [editingFrequencyType, setEditingFrequencyType] = useState<'preset' | 'custom'>('preset');

    const handleDosageChange = (value: string) => {
        if (value === 'other') {
            setDosageType('custom');
            onNewMedicineChange('dosage', '');
        } else if (value === '') {
            // Empty selection - reset to preset
            setDosageType('preset');
            onNewMedicineChange('dosage', '');
        } else {
            setDosageType('preset');
            onNewMedicineChange('dosage', value);
        }
    };

    const handleFrequencyChange = (value: string) => {
        if (value === 'other') {
            setFrequencyType('custom');
            onNewMedicineChange('frequency', '');
        } else if (value === '') {
            // Empty selection - reset to preset
            setFrequencyType('preset');
            onNewMedicineChange('frequency', '');
        } else {
            setFrequencyType('preset');
            onNewMedicineChange('frequency', value);
        }
    };

    const handleEditDosageChange = (value: string) => {
        if (value === 'other') {
            setEditingDosageType('custom');
            onEditChange('dosage', '');
        } else if (value === '') {
            // Empty selection - reset to preset
            setEditingDosageType('preset');
            onEditChange('dosage', '');
        } else {
            setEditingDosageType('preset');
            onEditChange('dosage', value);
        }
    };

    const handleEditFrequencyChange = (value: string) => {
        if (value === 'other') {
            setEditingFrequencyType('custom');
            onEditChange('frequency', '');
        } else if (value === '') {
            // Empty selection - reset to preset
            setEditingFrequencyType('preset');
            onEditChange('frequency', '');
        } else {
            setEditingFrequencyType('preset');
            onEditChange('frequency', value);
        }
    };

    // Detect if editing values match presets
    useEffect(() => {
        if (editingMedicine && editingMedicineData) {
            const dosageMatchesPreset = DOSAGE_OPTIONS.some(
                (opt) => opt.value !== 'other' && opt.value === editingMedicineData.dosage
            );
            setEditingDosageType(dosageMatchesPreset ? 'preset' : 'custom');

            const frequencyMatchesPreset = FREQUENCY_OPTIONS.some(
                (opt) => opt.value !== 'other' && opt.value === editingMedicineData.frequency
            );
            setEditingFrequencyType(frequencyMatchesPreset ? 'preset' : 'custom');
        }
    }, [editingMedicine, editingMedicineData]);

    // Reset to preset mode when form is cleared after successful add
    // This effect only runs when all fields become empty (after add)
    // It won't interfere with custom input state while user is filling the form
    const prevFormEmpty = useRef(true);
    useEffect(() => {
        const isFormEmpty = !newMedicine.name && !newMedicine.dosage && !newMedicine.frequency;
        
        // Only reset if form just became empty (was not empty before, now is empty)
        // This happens after successful add when form is cleared
        if (isFormEmpty && !prevFormEmpty.current) {
            setDosageType('preset');
            setFrequencyType('preset');
        }
        
        prevFormEmpty.current = isFormEmpty;
    }, [newMedicine.name, newMedicine.dosage, newMedicine.frequency]);

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
            <div className="mb-6 space-y-4 rounded-lg border-2 border-gray-200 bg-white p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Medicine Name</label>
                        <AutocompleteInput
                            value={newMedicine.name}
                            onChange={(value) => onNewMedicineChange('name', value)}
                            placeholder="Enter medicine name"
                            suggestions={COMMON_MEDICINES}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Dosage</label>
                        {dosageType === 'preset' ? (
                            <select
                                key="dosage-select"
                                value={newMedicine.dosage === 'other' ? '' : (newMedicine.dosage || '')}
                                onChange={(e) => handleDosageChange(e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                            >
                                <option value="">Select dosage</option>
                                {DOSAGE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    value={newMedicine.dosage}
                                    onChange={(e) => onNewMedicineChange('dosage', e.target.value)}
                                    placeholder="Enter custom dosage"
                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDosageType('preset');
                                        onNewMedicineChange('dosage', '');
                                    }}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                >
                                    Use preset options
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Frequency</label>
                        {frequencyType === 'preset' ? (
                            <select
                                key="frequency-select"
                                value={newMedicine.frequency === 'other' ? '' : (newMedicine.frequency || '')}
                                onChange={(e) => handleFrequencyChange(e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                            >
                                <option value="">Select frequency</option>
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    value={newMedicine.frequency}
                                    onChange={(e) => onNewMedicineChange('frequency', e.target.value)}
                                    placeholder="Enter custom frequency"
                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFrequencyType('preset');
                                        onNewMedicineChange('frequency', '');
                                    }}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                >
                                    Use preset options
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
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
                                Add Medicine
                            </>
                        )}
                    </Button>
                </div>
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
                                    <AutocompleteInput
                                        value={editingMedicineData?.name || ''}
                                        onChange={(value) => onEditChange('name', value)}
                                        placeholder="Medicine name"
                                        suggestions={COMMON_MEDICINES}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    />
                                    <div className="flex-1">
                                        {editingDosageType === 'preset' ? (
                                            <select
                                                key="edit-dosage-select"
                                                value={editingMedicineData?.dosage === 'other' ? '' : (editingMedicineData?.dosage || '')}
                                                onChange={(e) => handleEditDosageChange(e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                            >
                                                <option value="">Select dosage</option>
                                                {DOSAGE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="text"
                                                    value={editingMedicineData?.dosage || ''}
                                                    onChange={(e) => onEditChange('dosage', e.target.value)}
                                                    placeholder="Enter custom dosage"
                                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingDosageType('preset');
                                                        onEditChange('dosage', '');
                                                    }}
                                                    className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                                >
                                                    Use preset options
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {editingFrequencyType === 'preset' ? (
                                            <select
                                                key="edit-frequency-select"
                                                value={editingMedicineData?.frequency === 'other' ? '' : (editingMedicineData?.frequency || '')}
                                                onChange={(e) => handleEditFrequencyChange(e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                            >
                                                <option value="">Select frequency</option>
                                                {FREQUENCY_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="text"
                                                    value={editingMedicineData?.frequency || ''}
                                                    onChange={(e) => onEditChange('frequency', e.target.value)}
                                                    placeholder="Enter custom frequency"
                                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingFrequencyType('preset');
                                                        onEditChange('frequency', '');
                                                    }}
                                                    className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                                >
                                                    Use preset options
                                                </button>
                                            </div>
                                        )}
                                    </div>
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

