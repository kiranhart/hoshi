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
            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 p-2 shadow-md">
                    <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Diagnoses & Conditions</h3>
            </div>

            {/* Add Diagnosis Form */}
            <div className="mb-6 space-y-4 rounded-lg border-2 border-gray-200 bg-white p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Diagnosis/Condition Name</label>
                        <AutocompleteInput
                            value={newDiagnosis.name}
                            onChange={(value) => onNewDiagnosisChange('name', value)}
                            placeholder="Enter diagnosis or condition"
                            suggestions={COMMON_DIAGNOSES}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Severity (Optional)</label>
                        <select
                            value={newDiagnosis.severity}
                            onChange={(e) => onNewDiagnosisChange('severity', e.target.value)}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                        >
                            <option value="">None</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Date Diagnosed (Optional)</label>
                        <input
                            type="date"
                            value={newDiagnosis.diagnosisDate}
                            onChange={(e) => onNewDiagnosisChange('diagnosisDate', e.target.value)}
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                        value={newDiagnosis.description}
                        onChange={(e) => onNewDiagnosisChange('description', e.target.value)}
                        placeholder="Add any additional notes or details..."
                        rows={3}
                        className="w-full resize-none rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={onAddDiagnosis}
                        disabled={isAddingDiagnosis}
                        className="cursor-pointer bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 hover:shadow-xl hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="space-y-3">
                {localDiagnoses.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                        <Stethoscope className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">No diagnoses added yet.</p>
                        <p className="mt-1 text-sm text-gray-400">Add your first diagnosis or condition above.</p>
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
                                    className={`group flex items-start gap-3 rounded-xl border-2 bg-white p-5 shadow-sm transition-all duration-200 ${
                                        draggedIndex === index
                                            ? 'scale-95 border-rose-400 opacity-40 shadow-lg'
                                            : dragOverIndex === index && draggedIndex !== null
                                              ? 'translate-y-0 border-rose-300 bg-rose-50 shadow-md'
                                              : hoveredIndex === index && draggedIndex !== null && draggedIndex !== index
                                                ? 'translate-y-1 border-rose-200 bg-rose-50/50'
                                                : 'border-gray-200 hover:border-rose-200 hover:shadow-md'
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
                                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <select
                                                            value={editingDiagnosisData?.severity || ''}
                                                            onChange={(e) => onEditChange('severity', e.target.value)}
                                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
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
                                                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={editingDiagnosisData?.description || ''}
                                                    onChange={(e) => onEditChange('description', e.target.value)}
                                                    placeholder="Description (optional)"
                                                    rows={2}
                                                    className="w-full resize-none rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => onEditSave(diagnosis.id)}
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
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex cursor-move items-center justify-center px-2 text-gray-400 transition-colors hover:text-gray-600">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2.5">
                                                    <h4 className="text-lg font-semibold text-gray-900">{diagnosis.name}</h4>
                                                    {diagnosis.severity && (
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ${
                                                                diagnosis.severity === 'critical'
                                                                    ? 'bg-red-600 text-white'
                                                                    : diagnosis.severity === 'severe'
                                                                      ? 'bg-orange-500 text-white'
                                                                      : diagnosis.severity === 'moderate'
                                                                        ? 'bg-yellow-500 text-white'
                                                                        : 'bg-green-500 text-white'
                                                            }`}
                                                        >
                                                            {diagnosis.severity}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {diagnosis.diagnosisDate && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm">
                                                            <span className="text-rose-600">📅</span>
                                                            <span className="font-semibold">Diagnosed:</span>
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
                                                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{diagnosis.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-start gap-1.5 pt-1">
                                                <Button
                                                    onClick={() => onEditStart(diagnosis)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 cursor-pointer text-gray-400 transition-colors hover:bg-emerald-50 hover:text-rose-600"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => onDelete(diagnosis.id, diagnosis.name)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 cursor-pointer text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
