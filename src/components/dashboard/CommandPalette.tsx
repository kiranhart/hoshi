'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pill, AlertTriangle, Stethoscope, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMMON_MEDICINES, COMMON_ALLERGIES, COMMON_DIAGNOSES } from '@/lib/medical-data';

type ItemType = 'medicine' | 'allergy' | 'diagnosis' | null;

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMedicine: (data: { name: string; dosage: string; frequency: string }) => Promise<void>;
    onAddAllergy: (data: { name: string; reaction: string; severity: string; isMedicine: boolean }) => Promise<void>;
    onAddDiagnosis: (data: { name: string; severity: string; diagnosisDate: string; description: string }) => Promise<void>;
    isAdding: boolean;
}

const SEVERITY_OPTIONS = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'life-threatening', label: 'Life-threatening' },
    { value: 'critical', label: 'Critical' },
];

export function CommandPalette({
    isOpen,
    onClose,
    onAddMedicine,
    onAddAllergy,
    onAddDiagnosis,
    isAdding,
}: CommandPaletteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<ItemType>(null);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [medicineForm, setMedicineForm] = useState({ name: '', dosage: '', frequency: '' });
    const [allergyForm, setAllergyForm] = useState({ name: '', reaction: '', severity: 'mild', isMedicine: false });
    const [diagnosisForm, setDiagnosisForm] = useState({ name: '', severity: '', diagnosisDate: '', description: '' });

    // Filter suggestions based on search query
    const filteredMedicines = COMMON_MEDICINES.filter((m) =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
    const filteredAllergies = COMMON_ALLERGIES.filter((a) =>
        a.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
    const filteredDiagnoses = COMMON_DIAGNOSES.filter((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSelectedType(null);
            setSelectedItem('');
            setShowSuggestions(false);
            setMedicineForm({ name: '', dosage: '', frequency: '' });
            setAllergyForm({ name: '', reaction: '', severity: 'mild', isMedicine: false });
            setDiagnosisForm({ name: '', severity: '', diagnosisDate: '', description: '' });
        } else {
            // Focus search input when dialog opens
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleTypeSelect = (type: ItemType) => {
        setSelectedType(type);
        setSearchQuery('');
        setShowSuggestions(false);
        // Reset form fields when switching types
        if (type === 'medicine') {
            setMedicineForm({ name: '', dosage: '', frequency: '' });
        } else if (type === 'allergy') {
            setAllergyForm({ name: '', reaction: '', severity: 'mild', isMedicine: false });
        } else if (type === 'diagnosis') {
            setDiagnosisForm({ name: '', severity: '', diagnosisDate: '', description: '' });
        }
    };

    const handleItemSelect = (item: string) => {
        setSelectedItem(item);
        if (selectedType === 'medicine') {
            setMedicineForm({ ...medicineForm, name: item });
        } else if (selectedType === 'allergy') {
            setAllergyForm({ ...allergyForm, name: item });
        } else if (selectedType === 'diagnosis') {
            setDiagnosisForm({ ...diagnosisForm, name: item });
        }
        setSearchQuery(item);
        setShowSuggestions(false); // Hide suggestions after selection
    };

    const handleSubmit = async () => {
        if (selectedType === 'medicine') {
            if (!medicineForm.name.trim()) return;
            await onAddMedicine(medicineForm);
            onClose();
        } else if (selectedType === 'allergy') {
            if (!allergyForm.name.trim()) return;
            await onAddAllergy(allergyForm);
            onClose();
        } else if (selectedType === 'diagnosis') {
            if (!diagnosisForm.name.trim()) return;
            await onAddDiagnosis(diagnosisForm);
            onClose();
        }
    };

    const canSubmit = () => {
        if (selectedType === 'medicine') {
            return medicineForm.name.trim() !== '';
        } else if (selectedType === 'allergy') {
            return allergyForm.name.trim() !== '';
        } else if (selectedType === 'diagnosis') {
            return diagnosisForm.name.trim() !== '';
        }
        return false;
    };

    const getSuggestions = () => {
        if (!searchQuery.trim()) return [];
        if (selectedType === 'medicine') {
            return filteredMedicines;
        } else if (selectedType === 'allergy') {
            return filteredAllergies;
        } else if (selectedType === 'diagnosis') {
            return filteredDiagnoses;
        }
        return [];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="cursor-pointer fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    >
                        <div className="flex flex-col max-h-[80vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 p-2">
                                        <Search className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Quick Add</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {!selectedType ? (
                                    // Type selection
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">What would you like to add?</p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <button
                                                onClick={() => handleTypeSelect('medicine')}
                                                className="cursor-pointer flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
                                            >
                                                <div className="rounded-lg bg-indigo-100 p-2">
                                                    <Pill className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">Medicine</div>
                                                    <div className="text-xs text-gray-500">Add a medication</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleTypeSelect('allergy')}
                                                className="cursor-pointer flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-md"
                                            >
                                                <div className="rounded-lg bg-red-100 p-2">
                                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">Allergy</div>
                                                    <div className="text-xs text-gray-500">Add an allergy</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleTypeSelect('diagnosis')}
                                                className="cursor-pointer flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                                            >
                                                <div className="rounded-lg bg-blue-100 p-2">
                                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">Diagnosis</div>
                                                    <div className="text-xs text-gray-500">Add a condition</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Form view
                                    <div className="space-y-6">
                                        {/* Back button */}
                                        <button
                                            onClick={() => setSelectedType(null)}
                                            className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            <X className="h-4 w-4" />
                                            Back to selection
                                        </button>

                                        {/* Search input */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                {selectedType === 'medicine' && 'Search or Type Medicine Name'}
                                                {selectedType === 'allergy' && 'Search or Type Allergy Name'}
                                                {selectedType === 'diagnosis' && 'Search or Type Diagnosis/Condition Name'}
                                            </label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSearchQuery(value);
                                                        setShowSuggestions(true); // Show suggestions when typing
                                                        // Also update the form field as user types
                                                        if (selectedType === 'medicine') {
                                                            setMedicineForm({ ...medicineForm, name: value });
                                                        } else if (selectedType === 'allergy') {
                                                            setAllergyForm({ ...allergyForm, name: value });
                                                        } else if (selectedType === 'diagnosis') {
                                                            setDiagnosisForm({ ...diagnosisForm, name: value });
                                                        }
                                                    }}
                                                    onFocus={() => {
                                                        // Show suggestions when input is focused and has query
                                                        if (searchQuery.trim()) {
                                                            setShowSuggestions(true);
                                                        }
                                                    }}
                                                    placeholder={
                                                        selectedType === 'medicine'
                                                            ? 'Type to search medicines or enter name...'
                                                            : selectedType === 'allergy'
                                                              ? 'Type to search allergies or enter name...'
                                                              : 'Type to search diagnoses or enter name...'
                                                    }
                                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-10 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                />
                                            </div>

                                            {/* Suggestions */}
                                            {showSuggestions && searchQuery.trim() && getSuggestions().length > 0 && (
                                                <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
                                                    {getSuggestions().map((item, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleItemSelect(item)}
                                                            className="cursor-pointer w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Medicine Form */}
                                        {selectedType === 'medicine' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Dosage
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={medicineForm.dosage}
                                                        onChange={(e) =>
                                                            setMedicineForm({ ...medicineForm, dosage: e.target.value })
                                                        }
                                                        placeholder="e.g., 100mg"
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Frequency
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={medicineForm.frequency}
                                                        onChange={(e) =>
                                                            setMedicineForm({ ...medicineForm, frequency: e.target.value })
                                                        }
                                                        placeholder="e.g., Twice daily"
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Allergy Form */}
                                        {selectedType === 'allergy' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Reaction
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={allergyForm.reaction}
                                                        onChange={(e) =>
                                                            setAllergyForm({ ...allergyForm, reaction: e.target.value })
                                                        }
                                                        placeholder="e.g., Rash, hives"
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Severity
                                                    </label>
                                                    <select
                                                        value={allergyForm.severity}
                                                        onChange={(e) =>
                                                            setAllergyForm({ ...allergyForm, severity: e.target.value })
                                                        }
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    >
                                                        {SEVERITY_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isMedicine"
                                                        checked={allergyForm.isMedicine}
                                                        onChange={(e) =>
                                                            setAllergyForm({ ...allergyForm, isMedicine: e.target.checked })
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor="isMedicine" className="text-sm font-medium text-gray-700">
                                                        This is a medicine allergy
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Diagnosis Form */}
                                        {selectedType === 'diagnosis' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Severity
                                                    </label>
                                                    <select
                                                        value={diagnosisForm.severity}
                                                        onChange={(e) =>
                                                            setDiagnosisForm({ ...diagnosisForm, severity: e.target.value })
                                                        }
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    >
                                                        <option value="">Not specified</option>
                                                        {SEVERITY_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Diagnosis Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={diagnosisForm.diagnosisDate}
                                                        onChange={(e) =>
                                                            setDiagnosisForm({ ...diagnosisForm, diagnosisDate: e.target.value })
                                                        }
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={diagnosisForm.description}
                                                        onChange={(e) =>
                                                            setDiagnosisForm({ ...diagnosisForm, description: e.target.value })
                                                        }
                                                        placeholder="Additional notes about this diagnosis..."
                                                        rows={3}
                                                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {selectedType && (
                                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isAdding}
                                        className="cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit() || isAdding}
                                        className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

