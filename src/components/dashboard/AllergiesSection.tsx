'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Edit2, GripVertical, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from './AutocompleteInput';
import { COMMON_ALLERGIES } from '@/lib/medical-data';
import { type Allergy } from '@/lib/types';

interface AllergiesSectionProps {
    allergies: Allergy[];
    newAllergy: { name: string; reaction: string; severity: string; isMedicine: boolean };
    editingAllergy: string | null;
    editingAllergyData: { name: string; reaction: string; severity: string; isMedicine: boolean };
    isAddingAllergy: boolean;
    onNewAllergyChange: (field: string, value: string | boolean) => void;
    onAddAllergy: () => void;
    onEditStart: (allergy: Allergy) => void;
    onEditCancel: () => void;
    onEditChange: (field: string, value: string | boolean) => void;
    onEditSave: (id: string) => void;
    onDelete: (id: string, name: string) => void;
    onReorder: (allergyIds: string[], optimisticOrder: Allergy[]) => Promise<void>;
}

export function AllergiesSection({
    allergies,
    newAllergy,
    editingAllergy,
    editingAllergyData,
    isAddingAllergy,
    onNewAllergyChange,
    onAddAllergy,
    onEditStart,
    onEditCancel,
    onEditChange,
    onEditSave,
    onDelete,
    onReorder,
}: AllergiesSectionProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [localAllergies, setLocalAllergies] = useState<Allergy[]>(allergies);
    const [isReordering, setIsReordering] = useState(false);

    // Sync local state with prop changes (but not during reordering)
    useEffect(() => {
        if (!isReordering) {
            setLocalAllergies(allergies);
        }
    }, [allergies, isReordering]);

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
        const originalOrder = [...localAllergies];

        // Optimistically update local state
        const newOrder = [...localAllergies];
        const [removed] = newOrder.splice(draggedIndex, 1);

        // Adjust target index if dragging down
        const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newOrder.splice(adjustedIndex, 0, removed);

        // Update display order for smooth animation
        const updatedOrder = newOrder.map((allergy, index) => ({
            ...allergy,
            displayOrder: index,
        }));

        // Optimistically update UI immediately
        setIsReordering(true);
        setLocalAllergies(updatedOrder);
        setDraggedIndex(null);
        setDragOverIndex(null);
        setHoveredIndex(null);

        // Make API call in background
        const allergyIds = updatedOrder.map((a) => a.id);
        try {
            await onReorder(allergyIds, updatedOrder);
        } catch (error) {
            // Revert on error
            console.error('Failed to reorder allergies:', error);
            setLocalAllergies(originalOrder);
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
            transition={{ delay: 0.5 }}
            className="rounded-lg border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80"
        >
            <div className="mb-4 flex items-center gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 p-1.5 shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Allergies</h3>
            </div>

            {/* Add Allergy Form */}
            <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Allergy Name</label>
                        <AutocompleteInput
                            value={newAllergy.name}
                            onChange={(value) => onNewAllergyChange('name', value)}
                            placeholder="Enter allergy name"
                            suggestions={COMMON_ALLERGIES}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-pink-500"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Reaction</label>
                        <input
                            type="text"
                            value={newAllergy.reaction}
                            onChange={(e) => onNewAllergyChange('reaction', e.target.value)}
                            placeholder="Reaction (optional)"
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-pink-500"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                        <select
                            value={newAllergy.severity}
                            onChange={(e) => onNewAllergyChange('severity', e.target.value)}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-pink-500"
                        >
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                            <option value="life-threatening">Life-threatening</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <label className="flex w-full items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                            <input
                                type="checkbox"
                                checked={newAllergy.isMedicine}
                                onChange={(e) => onNewAllergyChange('isMedicine', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400/20"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medicine</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={onAddAllergy}
                        disabled={isAddingAllergy}
                        className="cursor-pointer bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white shadow-lg shadow-pink-500/30 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 hover:shadow-xl hover:shadow-pink-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isAddingAllergy ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Allergy
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Allergies List */}
            <div className="space-y-2">
                {localAllergies.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50 to-pink-50/30 py-16 text-center dark:border-gray-700/80 dark:from-gray-800 dark:to-pink-950/30">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900">
                            <AlertTriangle className="h-8 w-8 text-pink-400 dark:text-pink-300" />
                        </div>
                        <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No allergies added yet.</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first allergy above.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {localAllergies.map((allergy, index) => (
                            <motion.div
                                key={allergy.id}
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
                                    <div className="absolute -top-1.5 right-0 left-0 z-10 h-1 rounded-full bg-pink-500 shadow-lg" />
                                )}

                                <div
                                    draggable={editingAllergy !== allergy.id}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`group flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 dark:bg-gray-800 ${
                                        draggedIndex === index
                                            ? 'scale-95 border-pink-400 opacity-40 shadow-lg dark:border-pink-500'
                                            : dragOverIndex === index && draggedIndex !== null
                                              ? 'translate-y-0 border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 shadow-lg dark:border-pink-500 dark:from-pink-950/50 dark:to-rose-950/50'
                                              : hoveredIndex === index && draggedIndex !== null && draggedIndex !== index
                                                ? 'translate-y-1 border-pink-300 bg-gradient-to-r from-pink-50/50 to-rose-50/50 dark:border-pink-600 dark:from-pink-950/30 dark:to-rose-950/30'
                                                : 'border-gray-200/80 hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-50/50 hover:via-rose-50/30 hover:to-pink-50/50 hover:shadow-md dark:border-gray-700/80 dark:hover:border-pink-600 dark:hover:from-pink-950/30 dark:hover:via-rose-950/20 dark:hover:to-pink-950/30'
                                    }`}
                                >
                            {editingAllergy === allergy.id ? (
                                <>
                                    <AutocompleteInput
                                        value={editingAllergyData.name}
                                        onChange={(value) => onEditChange('name', value)}
                                        placeholder="Allergy name"
                                        suggestions={COMMON_ALLERGIES}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-cyan-500"
                                    />
                                    <input
                                        type="text"
                                        value={editingAllergyData.reaction}
                                        onChange={(e) => onEditChange('reaction', e.target.value)}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-cyan-500"
                                        placeholder="Reaction (optional)"
                                    />
                                    <select
                                        value={editingAllergyData.severity}
                                        onChange={(e) => onEditChange('severity', e.target.value)}
                                        className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    >
                                        <option value="mild">Mild</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="severe">Severe</option>
                                        <option value="life-threatening">Life-threatening</option>
                                    </select>
                                    <label className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={editingAllergyData.isMedicine}
                                            onChange={(e) => onEditChange('isMedicine', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400/20"
                                        />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">Medicine</span>
                                    </label>
                                    <Button
                                        onClick={() => onEditSave(allergy.id)}
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
                                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="flex cursor-move items-center justify-center self-center rounded-lg px-2 py-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-pink-500 dark:hover:bg-gray-700 dark:hover:text-pink-400">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{allergy.name}</p>
                                            {allergy.isMedicine && (
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                    Medicine
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(() => {
                                                // Color coding based on severity (same as public page)
                                                const severityColors = {
                                                    'life-threatening': {
                                                        border: 'border-red-500',
                                                        bg: 'bg-red-50',
                                                        text: 'text-red-700',
                                                        badge: 'bg-red-600 text-white',
                                                    },
                                                    severe: {
                                                        border: 'border-orange-400',
                                                        bg: 'bg-orange-50',
                                                        text: 'text-orange-700',
                                                        badge: 'bg-orange-500 text-white',
                                                    },
                                                    moderate: {
                                                        border: 'border-yellow-400',
                                                        bg: 'bg-yellow-50',
                                                        text: 'text-yellow-700',
                                                        badge: 'bg-yellow-500 text-white',
                                                    },
                                                    mild: {
                                                        border: 'border-green-400',
                                                        bg: 'bg-green-50',
                                                        text: 'text-green-700',
                                                        badge: 'bg-green-500 text-white',
                                                    },
                                                };
                                                const colors = severityColors[allergy.severity as keyof typeof severityColors] || severityColors.moderate;
                                                
                                                return (
                                                    <>
                                                        {allergy.reaction && (
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full border ${colors.border} ${colors.bg} ${colors.text} px-3 py-1 text-xs font-medium`}>
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                                <span className="font-semibold">Reaction:</span>
                                                                <span>{allergy.reaction}</span>
                                                            </span>
                                                        )}
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors.badge}`}>
                                                            {allergy.severity}
                                                        </span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onEditStart(allergy)}
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-gray-400 hover:text-cyan-500"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(allergy.id, allergy.name)}
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

