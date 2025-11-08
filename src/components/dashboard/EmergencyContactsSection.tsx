'use client';

import { motion } from 'framer-motion';
import { Check, Edit2, Loader2, Phone, Plus, Trash2, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type EmergencyContact } from '@/lib/types';

interface EmergencyContactsSectionProps {
    contacts: EmergencyContact[];
    newContact: { name: string; phone: string; email: string; relation: string };
    editingContact: string | null;
    editingContactData: { name: string; phone: string; email: string; relation: string } | null;
    isAddingContact: boolean;
    onNewContactChange: (field: string, value: string) => void;
    onAddContact: () => void;
    onEditStart: (contact: EmergencyContact) => void;
    onEditCancel: () => void;
    onEditChange: (field: string, value: string) => void;
    onEditSave: (id: string) => void;
    onDelete: (id: string, name: string) => void;
}

export function EmergencyContactsSection({
    contacts,
    newContact,
    editingContact,
    editingContactData,
    isAddingContact,
    onNewContactChange,
    onAddContact,
    onEditStart,
    onEditCancel,
    onEditChange,
    onEditSave,
    onDelete,
}: EmergencyContactsSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 p-2 shadow-md">
                    <Phone className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Emergency Contacts</h3>
            </div>

            {/* Add Contact Form */}
            <div className="mb-6 grid gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 md:grid-cols-5">
                <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => onNewContactChange('name', e.target.value)}
                    placeholder="Contact name"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <input
                    type="text"
                    value={newContact.relation}
                    onChange={(e) => onNewContactChange('relation', e.target.value)}
                    placeholder="Relation (optional)"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => onNewContactChange('phone', e.target.value)}
                    placeholder="Phone"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => onNewContactChange('email', e.target.value)}
                    placeholder="Email"
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <Button
                    onClick={onAddContact}
                    disabled={isAddingContact}
                    className="cursor-pointer bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isAddingContact ? (
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

            {/* Contacts List */}
            <div className="space-y-3">
                {contacts.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">No emergency contacts added yet.</p>
                ) : (
                    contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center gap-4 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm">
                            {editingContact === contact.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingContactData?.name || ''}
                                        onChange={(e) => onEditChange('name', e.target.value)}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                        placeholder="Contact name"
                                    />
                                    <input
                                        type="text"
                                        value={editingContactData?.relation || ''}
                                        onChange={(e) => onEditChange('relation', e.target.value)}
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                        placeholder="Relation (optional)"
                                    />
                                    <input
                                        type="tel"
                                        value={editingContactData?.phone || ''}
                                        onChange={(e) => onEditChange('phone', e.target.value)}
                                        placeholder="Phone"
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    />
                                    <input
                                        type="email"
                                        value={editingContactData?.email || ''}
                                        onChange={(e) => onEditChange('email', e.target.value)}
                                        placeholder="Email"
                                        className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                                    />
                                    <Button
                                        onClick={() => onEditSave(contact.id)}
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
                                            <p className="font-semibold text-gray-900">{contact.name}</p>
                                            {contact.relation && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                                    <User className="h-3 w-3 text-indigo-600" />
                                                    <span>{contact.relation}</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {contact.phone && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                    <Phone className="h-3.5 w-3.5 text-green-600" />
                                                    <span className="font-semibold">Phone:</span>
                                                    <span>{contact.phone}</span>
                                                </span>
                                            )}
                                            {contact.email && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                                                    <span className="text-purple-600">✉</span>
                                                    <span className="font-semibold">Email:</span>
                                                    <span>{contact.email}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onEditStart(contact)}
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-gray-400 hover:text-cyan-500"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(contact.id, contact.name)}
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

