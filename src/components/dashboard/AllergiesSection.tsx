'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check, Edit2, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Allergy {
    id: string;
    name: string;
    reaction: string | null;
    severity: string;
    isMedicine: boolean;
}

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
}: AllergiesSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 p-2 shadow-md">
                    <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Allergies</h3>
            </div>

            {/* Add Allergy Form */}
            <div className="mb-6 grid gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 md:grid-cols-5">
                <input
                    type="text"
                    value={newAllergy.name}
                    onChange={(e) => onNewAllergyChange('name', e.target.value)}
                    placeholder="Allergy name"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <input
                    type="text"
                    value={newAllergy.reaction}
                    onChange={(e) => onNewAllergyChange('reaction', e.target.value)}
                    placeholder="Reaction (optional)"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <select
                    value={newAllergy.severity}
                    onChange={(e) => onNewAllergyChange('severity', e.target.value)}
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="life-threatening">Life-threatening</option>
                </select>
                <label className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2">
                    <input
                        type="checkbox"
                        checked={newAllergy.isMedicine}
                        onChange={(e) => onNewAllergyChange('isMedicine', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400/20"
                    />
                    <span className="text-sm text-gray-700">Medicine</span>
                </label>
                <Button
                    onClick={onAddAllergy}
                    disabled={isAddingAllergy}
                    className="cursor-pointer bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isAddingAllergy ? (
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

            {/* Allergies List */}
            <div className="space-y-3">
                {allergies.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">No allergies added yet.</p>
                ) : (
                    allergies.map((allergy) => (
                        <div key={allergy.id} className="flex items-center gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm">
                            {editingAllergy === allergy.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingAllergyData.name}
                                        onChange={(e) => onEditChange('name', e.target.value)}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                        placeholder="Allergy name"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        value={editingAllergyData.reaction}
                                        onChange={(e) => onEditChange('reaction', e.target.value)}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
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
                                        <span className="text-xs text-gray-700">Medicine</span>
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
                                        className="cursor-pointer text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">{allergy.name}</p>
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
                    ))
                )}
            </div>
        </motion.div>
    );
}

