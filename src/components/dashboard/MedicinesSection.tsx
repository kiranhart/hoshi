'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Edit2, GripVertical, Loader2, Pill, Plus, Trash2, X } from 'lucide-react';
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
    onReorder: (medicineIds: string[], optimisticOrder: Medicine[]) => Promise<void>;
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
    onReorder,
}: MedicinesSectionProps) {
    const [dosageType, setDosageType] = useState<'preset' | 'custom'>('preset');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [localMedicines, setLocalMedicines] = useState<Medicine[]>(medicines);
    const [isReordering, setIsReordering] = useState(false);
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

    // Sync local state with prop changes (but not during reordering)
    useEffect(() => {
        if (!isReordering) {
            setLocalMedicines(medicines);
        }
    }, [medicines, isReordering]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === index) {
            setDragOverIndex(null);
            setHoveredIndex(null);
            return;
        }

        // Calculate the drop position based on mouse position
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const mouseY = e.clientY;

        // Determine if we should insert above or below
        if (mouseY < midpoint) {
            // Inserting above this item
            setDragOverIndex(index);
            setHoveredIndex(index);
        } else {
            // Inserting below this item
            setDragOverIndex(index + 1);
            setHoveredIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if we're actually leaving the container
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
            setHoveredIndex(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setHoveredIndex(null);
            return;
        }

        // Use the dragOverIndex if available, otherwise use dropIndex
        const targetIndex = dragOverIndex !== null ? dragOverIndex : dropIndex;

        if (draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setHoveredIndex(null);
            return;
        }

        // Save original order for potential rollback
        const originalOrder = [...localMedicines];

        // Optimistically update local state
        const newOrder = [...localMedicines];
        const [removed] = newOrder.splice(draggedIndex, 1);

        // Adjust target index if dragging down
        const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newOrder.splice(adjustedIndex, 0, removed);

        // Update display order for smooth animation
        const updatedOrder = newOrder.map((medicine, index) => ({
            ...medicine,
            displayOrder: index,
        }));

        // Optimistically update UI immediately
        setIsReordering(true);
        setLocalMedicines(updatedOrder);
        setDraggedIndex(null);
        setDragOverIndex(null);
        setHoveredIndex(null);

        // Make API call in background
        const medicineIds = updatedOrder.map((m) => m.id);
        try {
            await onReorder(medicineIds, updatedOrder);
        } catch (error) {
            // Revert on error
            console.error('Failed to reorder medicines:', error);
            setLocalMedicines(originalOrder);
        } finally {
            setIsReordering(false);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        setHoveredIndex(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80"
        >
            <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 p-1.5 shadow-sm">
                    <Pill className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Medicines</h3>
            </div>

            {/* Add Medicine Form */}
            <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Medicine Name</label>
                        <AutocompleteInput
                            value={newMedicine.name}
                            onChange={(value) => onNewMedicineChange('name', value)}
                            placeholder="Enter medicine name"
                            suggestions={COMMON_MEDICINES}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Dosage</label>
                        {dosageType === 'preset' ? (
                            <select
                                key="dosage-select"
                                value={newMedicine.dosage === 'other' ? '' : (newMedicine.dosage || '')}
                                onChange={(e) => handleDosageChange(e.target.value)}
                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-cyan-500"
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
                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
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
                                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-cyan-500"
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
                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
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
                        className="cursor-pointer bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 hover:shadow-xl hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="space-y-2">
                {localMedicines.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50 to-rose-50/30 py-16 text-center dark:border-gray-700/80 dark:from-gray-800 dark:to-rose-950/30">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900">
                            <Pill className="h-8 w-8 text-rose-400 dark:text-rose-300" />
                        </div>
                        <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No medicines added yet.</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first medicine above.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {localMedicines.map((medicine, index) => (
                            <motion.div
                                key={medicine.id}
                                layout
                                initial={false}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 30,
                                    mass: 1,
                                }}
                                className="relative"
                            >
                                {/* Drop indicator line */}
                                {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                                    <div className="absolute -top-1.5 right-0 left-0 z-10 h-1 rounded-full bg-rose-500 shadow-lg" />
                                )}

                                <div
                                    draggable={editingMedicine !== medicine.id}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`group flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 dark:bg-gray-800 ${
                                        draggedIndex === index
                                            ? 'scale-95 border-rose-400 opacity-40 shadow-lg dark:border-rose-500'
                                            : dragOverIndex === index && draggedIndex !== null
                                              ? 'translate-y-0 border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg dark:border-rose-500 dark:from-rose-950/50 dark:to-pink-950/50'
                                              : hoveredIndex === index && draggedIndex !== null && draggedIndex !== index
                                                ? 'translate-y-1 border-rose-300 bg-gradient-to-r from-rose-50/50 to-pink-50/50 dark:border-rose-600 dark:from-rose-950/30 dark:to-pink-950/30'
                                                : 'border-gray-200/80 hover:border-rose-300 hover:bg-gradient-to-r hover:from-rose-50/50 hover:via-pink-50/30 hover:to-rose-50/50 hover:shadow-md dark:border-gray-700/80 dark:hover:border-rose-600 dark:hover:from-rose-950/30 dark:hover:via-pink-950/20 dark:hover:to-rose-950/30'
                                    }`}
                                >
                            {editingMedicine === medicine.id ? (
                                <>
                                    <AutocompleteInput
                                        value={editingMedicineData?.name || ''}
                                        onChange={(value) => onEditChange('name', value)}
                                        placeholder="Medicine name"
                                        suggestions={COMMON_MEDICINES}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-cyan-500"
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
                                    <div className="flex cursor-move items-center justify-center self-center rounded-lg px-2 py-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-rose-500 dark:hover:bg-gray-700 dark:hover:text-rose-400">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{medicine.name}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {medicine.dosage && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300">
                                                    <span className="text-cyan-500 dark:text-cyan-400">💊</span>
                                                    <span className="font-semibold">Dosage:</span>
                                                    <span>{medicine.dosage}</span>
                                                </span>
                                            )}
                                            {medicine.frequency && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                                                    <span className="text-blue-500 dark:text-blue-400">⏰</span>
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
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}

