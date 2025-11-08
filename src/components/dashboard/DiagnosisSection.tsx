'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Edit2, GripVertical, Loader2, Plus, Stethoscope, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { COMMON_DIAGNOSES } from '@/lib/medical-data';
import { type Diagnosis } from '@/lib/types';

import { AutocompleteInput } from './AutocompleteInput';

interface DiagnosisSectionProps {
    diagnoses: Diagnosis[];
    newDiagnosis: { name: string; severity: string; diagnosisDate: string; description: string };
    editingDiagnosis: string | null;
    editingDiagnosisData: { name: string; severity: string; diagnosisDate: string; description: string } | null;
    isAddingDiagnosis: boolean;
    onNewDiagnosisChange: (field: string, value: string) => void;
    onAddDiagnosis: () => void;
    onEditStart: (diagnosis: Diagnosis) => void;
    onEditCancel: () => void;
    onEditChange: (field: string, value: string) => void;
    onEditSave: (id: string) => void;
    onDelete: (id: string, name: string) => void;
    onReorder: (diagnosisIds: string[], optimisticOrder: Diagnosis[]) => Promise<void>;
}

export function DiagnosisSection({
    diagnoses,
    newDiagnosis,
    editingDiagnosis,
    editingDiagnosisData,
    isAddingDiagnosis,
    onNewDiagnosisChange,
    onAddDiagnosis,
    onEditStart,
    onEditCancel,
    onEditChange,
    onEditSave,
    onDelete,
    onReorder,
}: DiagnosisSectionProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [localDiagnoses, setLocalDiagnoses] = useState<Diagnosis[]>(diagnoses);
    const [isReordering, setIsReordering] = useState(false);

    // Sync local state with prop changes (but not during reordering)
    useEffect(() => {
        if (!isReordering) {
            setLocalDiagnoses(diagnoses);
        }
    }, [diagnoses, isReordering]);

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
        const originalOrder = [...localDiagnoses];

        // Optimistically update local state
        const newOrder = [...localDiagnoses];
        const [removed] = newOrder.splice(draggedIndex, 1);

        // Adjust target index if dragging down
        const adjustedIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newOrder.splice(adjustedIndex, 0, removed);

        // Update display order for smooth animation
        const updatedOrder = newOrder.map((diagnosis, index) => ({
            ...diagnosis,
            displayOrder: index,
        }));

        // Optimistically update UI immediately
        setIsReordering(true);
        setLocalDiagnoses(updatedOrder);
        setDraggedIndex(null);
        setDragOverIndex(null);
        setHoveredIndex(null);

        // Make API call in background
        const diagnosisIds = updatedOrder.map((d) => d.id);
        try {
            await onReorder(diagnosisIds, updatedOrder);
        } catch (error) {
            // Revert on error
            console.error('Failed to reorder diagnoses:', error);
            setLocalDiagnoses(originalOrder);
        } finally {
            setIsReordering(false);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        setHoveredIndex(null);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-rose-50/30 p-6 shadow-lg backdrop-blur-md dark:border-gray-700/80 dark:from-gray-800 dark:via-gray-800 dark:to-rose-950/30"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-2.5 shadow-lg shadow-rose-500/30">
                    <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Diagnoses & Conditions</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Track and manage your medical diagnoses</p>
                </div>
            </div>

            {/* Add Diagnosis Form */}
            <div className="mb-6 space-y-4 rounded-xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/80">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Diagnosis/Condition Name</label>
                        <AutocompleteInput
                            value={newDiagnosis.name}
                            onChange={(value) => onNewDiagnosisChange('name', value)}
                            placeholder="Enter diagnosis or condition"
                            suggestions={COMMON_DIAGNOSES}
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-rose-400"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Severity (Optional)</label>
                        <select
                            value={newDiagnosis.severity}
                            onChange={(e) => onNewDiagnosisChange('severity', e.target.value)}
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:border-rose-400"
                        >
                            <option value="">None</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Date Diagnosed (Optional)</label>
                        <input
                            type="date"
                            value={newDiagnosis.diagnosisDate}
                            onChange={(e) => onNewDiagnosisChange('diagnosisDate', e.target.value)}
                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:border-rose-400"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                        value={newDiagnosis.description}
                        onChange={(e) => onNewDiagnosisChange('description', e.target.value)}
                        placeholder="Add any additional notes or details..."
                        rows={3}
                        className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-rose-400"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={onAddDiagnosis}
                        disabled={isAddingDiagnosis}
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-3 text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-105 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 hover:shadow-xl hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isAddingDiagnosis ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Diagnosis
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Diagnoses List */}
            <div className="space-y-2">
                {localDiagnoses.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50 to-rose-50/30 py-16 text-center dark:border-gray-700/80 dark:from-gray-800 dark:to-rose-950/30">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900">
                            <Stethoscope className="h-8 w-8 text-rose-400 dark:text-rose-300" />
                        </div>
                        <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No diagnoses added yet.</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first diagnosis or condition above.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {localDiagnoses.map((diagnosis, index) => (
                            <motion.div
                                key={diagnosis.id}
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
                                    draggable={editingDiagnosis !== diagnosis.id}
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
                                    {editingDiagnosis === diagnosis.id ? (
                                        <>
                                            <div className="flex-1 space-y-3">
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <div className="sm:col-span-2 lg:col-span-2">
                                                        <AutocompleteInput
                                                            value={editingDiagnosisData?.name || ''}
                                                            onChange={(value) => onEditChange('name', value)}
                                                            placeholder="Diagnosis name"
                                                            suggestions={COMMON_DIAGNOSES}
                                                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 transition-all hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:border-rose-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <select
                                                            value={editingDiagnosisData?.severity || ''}
                                                            onChange={(e) => onEditChange('severity', e.target.value)}
                                                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 transition-all hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:border-rose-400"
                                                        >
                                                            <option value="">None</option>
                                                            <option value="mild">Mild</option>
                                                            <option value="moderate">Moderate</option>
                                                            <option value="severe">Severe</option>
                                                            <option value="critical">Critical</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="date"
                                                            value={formatDate(editingDiagnosisData?.diagnosisDate || null)}
                                                            onChange={(e) => onEditChange('diagnosisDate', e.target.value)}
                                                            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 transition-all hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:border-rose-400"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={editingDiagnosisData?.description || ''}
                                                    onChange={(e) => onEditChange('description', e.target.value)}
                                                    placeholder="Description (optional)"
                                                    rows={2}
                                                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => onEditSave(diagnosis.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer rounded-xl text-green-600 transition-all hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-sm"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={onEditCancel}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer rounded-xl text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex cursor-move items-center justify-center self-center rounded-lg px-2 py-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-rose-500 dark:hover:bg-gray-700 dark:hover:text-rose-400">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{diagnosis.name}</h4>
                                                    {diagnosis.severity && (
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize shadow-md ${
                                                                diagnosis.severity === 'critical'
                                                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                                                                    : diagnosis.severity === 'severe'
                                                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                                                      : diagnosis.severity === 'moderate'
                                                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                                                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                            }`}
                                                        >
                                                            {diagnosis.severity}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {diagnosis.diagnosisDate && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm">
                                                            <span className="text-rose-600">📅</span>
                                                            <span className="font-bold">Diagnosed:</span>
                                                            <span>
                                                                {new Date(diagnosis.diagnosisDate).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                                {diagnosis.description && (
                                                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{diagnosis.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-start gap-1.5 pt-1">
                                                <Button
                                                    onClick={() => onEditStart(diagnosis)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 cursor-pointer rounded-xl text-gray-400 transition-all hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 hover:text-rose-600 hover:shadow-sm"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => onDelete(diagnosis.id, diagnosis.name)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 cursor-pointer rounded-xl text-gray-400 transition-all hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 hover:text-red-600 hover:shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
