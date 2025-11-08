'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Heart, LayoutDashboard, Phone, Pill, QrCode, Stethoscope, User } from 'lucide-react';
import { toast } from 'sonner';

import { AllergiesSection } from '@/components/dashboard/AllergiesSection';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar, type DashboardSection } from '@/components/dashboard/DashboardSidebar';
import { DeleteModal } from '@/components/dashboard/DeleteModal';
import { DiagnosisSection } from '@/components/dashboard/DiagnosisSection';
import { EmergencyContactsSection } from '@/components/dashboard/EmergencyContactsSection';
import { MedicinesSection } from '@/components/dashboard/MedicinesSection';
import { PageInformationSection } from '@/components/dashboard/PageInformationSection';
import { QRCodeSection } from '@/components/dashboard/QRCodeSection';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [hasUsername, setHasUsername] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(true);
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Page data state
    const [pageData, setPageData] = useState<any>(null);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSavingPage, setIsSavingPage] = useState(false);
    const [pageForm, setPageForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        description: '',
        isPrivate: false,
        colorMode: 'light' as const,
        primaryColor: '#FF6B6B',
    });

    // Medicines state
    const [medicines, setMedicines] = useState<any[]>([]);
    const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
    const [isAddingMedicine, setIsAddingMedicine] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<string | null>(null);
    const [editingMedicineData, setEditingMedicineData] = useState<{ name: string; dosage: string; frequency: string } | null>(null);
    const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', frequency: '' });

    // Allergies state
    const [allergies, setAllergies] = useState<any[]>([]);
    const [isLoadingAllergies, setIsLoadingAllergies] = useState(false);
    const [isAddingAllergy, setIsAddingAllergy] = useState(false);
    const [editingAllergy, setEditingAllergy] = useState<string | null>(null);
    const [editingAllergyData, setEditingAllergyData] = useState<{ name: string; reaction: string; severity: string; isMedicine: boolean }>({
        name: '',
        reaction: '',
        severity: 'mild',
        isMedicine: false,
    });
    const [newAllergy, setNewAllergy] = useState({ name: '', reaction: '', severity: 'mild', isMedicine: false });

    // Diagnoses state
    const [diagnoses, setDiagnoses] = useState<any[]>([]);
    const [isLoadingDiagnoses, setIsLoadingDiagnoses] = useState(false);
    const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);
    const [editingDiagnosis, setEditingDiagnosis] = useState<string | null>(null);
    const [editingDiagnosisData, setEditingDiagnosisData] = useState<{ name: string; severity: string; diagnosisDate: string; description: string } | null>(null);
    const [newDiagnosis, setNewDiagnosis] = useState({ name: '', severity: '', diagnosisDate: '', description: '' });

    // Emergency contacts state
    const [contacts, setContacts] = useState<any[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [editingContact, setEditingContact] = useState<string | null>(null);
    const [editingContactData, setEditingContactData] = useState<{ name: string; phone: string; email: string; relation: string } | null>(null);
    const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', relation: '' });

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'medicine' | 'allergy' | 'diagnosis' | 'contact' | null;
        id: string | null;
        name: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        type: null,
        id: null,
        name: '',
        isDeleting: false,
    });

    // Command palette state
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isCommandPaletteAdding, setIsCommandPaletteAdding] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Sidebar navigation state
    const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Check username and load page data on mount
    useEffect(() => {
        if (session?.user?.id) {
            checkUsername();
            checkAdminStatus();
            loadNotificationCount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // Load page data when username is set
    useEffect(() => {
        if (hasUsername === true) {
            loadPageData();
            loadMedicines();
            loadAllergies();
            loadDiagnoses();
            loadContacts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasUsername]);

    // Keyboard shortcut handler for command palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const checkUsername = async () => {
        try {
            setIsCheckingUsername(true);
            const response = await fetch('/api/user/username');
            if (response.ok) {
                const data = await response.json();
                setHasUsername(data.hasUsername);
            } else {
                console.error('Failed to check username');
                setHasUsername(false);
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setHasUsername(false);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const checkAdminStatus = async () => {
        try {
            // Try to fetch admin stats to check if user is admin
            const response = await fetch('/api/admin/stats');
            setIsAdmin(response.status !== 403);
        } catch (error) {
            setIsAdmin(false);
        }
    };

    const loadNotificationCount = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setUnreadNotificationCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notification count:', error);
        }
    };

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/user/username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (response.ok) {
                setHasUsername(true);
                setUsername('');
            } else {
                const data = await response.json();
                setUsernameError(data.error || 'Failed to set username');
            }
        } catch (error) {
            setUsernameError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load page data
    const loadPageData = async () => {
        try {
            setIsLoadingPage(true);
            const response = await fetch('/api/page');
            if (response.ok) {
                const data = await response.json();
                setPageData(data.page);
                setPageForm({
                    firstName: data.page?.firstName || '',
                    lastName: data.page?.lastName || '',
                    email: data.page?.email || '',
                    phone: data.page?.phone || '',
                    description: data.page?.description || '',
                    isPrivate: data.page?.isPrivate || false,
                    colorMode: data.page?.colorMode || 'light',
                    primaryColor: data.page?.primaryColor || '#FF6B6B',
                });
            }
        } catch (error) {
            console.error('Error loading page data:', error);
        } finally {
            setIsLoadingPage(false);
        }
    };

    // Save page data
    const savePageData = async () => {
        try {
            setIsSavingPage(true);
            const response = await fetch('/api/page', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pageForm),
            });
            if (response.ok) {
                const data = await response.json();
                setPageData(data.page);
                toast.success('Page information saved successfully!', {
                    description: 'Your changes have been saved.',
                });
            } else {
                toast.error('Failed to save page information', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error saving page data:', error);
            toast.error('Error saving page information', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsSavingPage(false);
        }
    };

    // Medicines functions
    const loadMedicines = async () => {
        try {
            setIsLoadingMedicines(true);
            const response = await fetch('/api/page/medicines');
            if (response.ok) {
                const data = await response.json();
                setMedicines(data.medicines || []);
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        } finally {
            setIsLoadingMedicines(false);
        }
    };

    const addMedicine = async () => {
        if (!newMedicine.name.trim() || isAddingMedicine) return;
        try {
            setIsAddingMedicine(true);
            const response = await fetch('/api/page/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMedicine),
            });
            if (response.ok) {
                setNewMedicine({ name: '', dosage: '', frequency: '' });
                await loadMedicines();
                toast.success('Medicine added successfully!', {
                    description: `${newMedicine.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add medicine', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding medicine:', error);
            toast.error('Error adding medicine', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsAddingMedicine(false);
        }
    };

    const updateMedicine = async (id: string, medicine: any) => {
        try {
            const response = await fetch(`/api/page/medicines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicine),
            });
            if (response.ok) {
                setEditingMedicine(null);
                loadMedicines();
                toast.success('Medicine updated successfully!', {
                    description: `${medicine.name} has been updated.`,
                });
            } else {
                toast.error('Failed to update medicine', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error updating medicine:', error);
            toast.error('Error updating medicine', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    const deleteMedicine = async (id: string, name: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'medicine',
            id,
            name,
            isDeleting: false,
        });
    };

    const confirmDeleteMedicine = async () => {
        if (!deleteModal.id) return;
        try {
            setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
            const response = await fetch(`/api/page/medicines/${deleteModal.id}`, { method: 'DELETE' });
            if (response.ok) {
                loadMedicines();
                setDeleteModal({ isOpen: false, type: null, id: null, name: '', isDeleting: false });
                toast.success('Medicine deleted successfully!', {
                    description: `${deleteModal.name} has been removed from your list.`,
                });
            } else {
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
                toast.error('Failed to delete medicine', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error deleting medicine:', error);
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            toast.error('Error deleting medicine', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    // Allergies functions
    const loadAllergies = async () => {
        try {
            setIsLoadingAllergies(true);
            const response = await fetch('/api/page/allergies');
            if (response.ok) {
                const data = await response.json();
                setAllergies(data.allergies || []);
            }
        } catch (error) {
            console.error('Error loading allergies:', error);
        } finally {
            setIsLoadingAllergies(false);
        }
    };

    const addAllergy = async () => {
        if (!newAllergy.name.trim() || isAddingAllergy) return;
        try {
            setIsAddingAllergy(true);
            const response = await fetch('/api/page/allergies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAllergy),
            });
            if (response.ok) {
                setNewAllergy({ name: '', reaction: '', severity: 'mild', isMedicine: false });
                await loadAllergies();
                toast.success('Allergy added successfully!', {
                    description: `${newAllergy.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add allergy', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding allergy:', error);
            toast.error('Error adding allergy', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsAddingAllergy(false);
        }
    };

    const updateAllergy = async (id: string, allergyData: { name: string; reaction: string; severity: string; isMedicine: boolean }) => {
        try {
            const response = await fetch(`/api/page/allergies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allergyData),
            });
            if (response.ok) {
                setEditingAllergy(null);
                setEditingAllergyData({ name: '', reaction: '', severity: 'mild', isMedicine: false });
                loadAllergies();
                toast.success('Allergy updated successfully!', {
                    description: `${allergyData.name} has been updated.`,
                });
            } else {
                toast.error('Failed to update allergy', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error updating allergy:', error);
            toast.error('Error updating allergy', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    const deleteAllergy = async (id: string, name: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'allergy',
            id,
            name,
            isDeleting: false,
        });
    };

    const confirmDeleteAllergy = async () => {
        if (!deleteModal.id) return;
        try {
            setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
            const response = await fetch(`/api/page/allergies/${deleteModal.id}`, { method: 'DELETE' });
            if (response.ok) {
                loadAllergies();
                setDeleteModal({ isOpen: false, type: null, id: null, name: '', isDeleting: false });
                toast.success('Allergy deleted successfully!', {
                    description: `${deleteModal.name} has been removed from your list.`,
                });
            } else {
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
                toast.error('Failed to delete allergy', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error deleting allergy:', error);
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            toast.error('Error deleting allergy', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    // Diagnoses functions
    const loadDiagnoses = async () => {
        try {
            setIsLoadingDiagnoses(true);
            const response = await fetch('/api/page/diagnoses');
            if (response.ok) {
                const data = await response.json();
                setDiagnoses(data.diagnoses || []);
            }
        } catch (error) {
            console.error('Error loading diagnoses:', error);
        } finally {
            setIsLoadingDiagnoses(false);
        }
    };

    const addDiagnosis = async () => {
        if (!newDiagnosis.name.trim() || isAddingDiagnosis) return;
        try {
            setIsAddingDiagnosis(true);
            const response = await fetch('/api/page/diagnoses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDiagnosis),
            });
            if (response.ok) {
                setNewDiagnosis({ name: '', severity: '', diagnosisDate: '', description: '' });
                await loadDiagnoses();
                toast.success('Diagnosis added successfully!', {
                    description: `${newDiagnosis.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add diagnosis', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding diagnosis:', error);
            toast.error('Error adding diagnosis', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsAddingDiagnosis(false);
        }
    };

    const updateDiagnosis = async (id: string, diagnosisData: { name: string; severity: string; diagnosisDate: string; description: string }) => {
        try {
            const response = await fetch(`/api/page/diagnoses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(diagnosisData),
            });
            if (response.ok) {
                setEditingDiagnosis(null);
                setEditingDiagnosisData(null);
                loadDiagnoses();
                toast.success('Diagnosis updated successfully!', {
                    description: `${diagnosisData.name} has been updated.`,
                });
            } else {
                toast.error('Failed to update diagnosis', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error updating diagnosis:', error);
            toast.error('Error updating diagnosis', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    const deleteDiagnosis = async (id: string, name: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'diagnosis',
            id,
            name,
            isDeleting: false,
        });
    };

    const confirmDeleteDiagnosis = async () => {
        if (!deleteModal.id) return;
        try {
            setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
            const response = await fetch(`/api/page/diagnoses/${deleteModal.id}`, { method: 'DELETE' });
            if (response.ok) {
                loadDiagnoses();
                setDeleteModal({ isOpen: false, type: null, id: null, name: '', isDeleting: false });
                toast.success('Diagnosis deleted successfully!', {
                    description: `${deleteModal.name} has been removed from your list.`,
                });
            } else {
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
                toast.error('Failed to delete diagnosis', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error deleting diagnosis:', error);
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            toast.error('Error deleting diagnosis', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    const reorderDiagnoses = async (diagnosisIds: string[], optimisticOrder: any[]) => {
        try {
            // Optimistically update the state immediately
            setDiagnoses(optimisticOrder);

            const response = await fetch('/api/page/diagnoses/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosisIds }),
            });
            
            if (response.ok) {
                // Reload to get the latest data from server
                await loadDiagnoses();
            } else {
                // Revert on error
                await loadDiagnoses();
                throw new Error('Failed to reorder diagnoses');
            }
        } catch (error) {
            console.error('Error reordering diagnoses:', error);
            // Reload to revert to server state
            await loadDiagnoses();
            toast.error('Failed to reorder diagnoses', {
                description: 'The order has been reverted. Please try again.',
            });
            throw error; // Re-throw so component can handle it
        }
    };

    const reorderAllergies = async (allergyIds: string[], optimisticOrder: any[]) => {
        try {
            // Optimistically update the state immediately
            setAllergies(optimisticOrder);

            const response = await fetch('/api/page/allergies/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allergyIds }),
            });
            
            if (response.ok) {
                // Reload to get the latest data from server
                await loadAllergies();
            } else {
                // Revert on error
                await loadAllergies();
                throw new Error('Failed to reorder allergies');
            }
        } catch (error) {
            console.error('Error reordering allergies:', error);
            // Reload to revert to server state
            await loadAllergies();
            toast.error('Failed to reorder allergies', {
                description: 'The order has been reverted. Please try again.',
            });
            throw error; // Re-throw so component can handle it
        }
    };

    const reorderMedicines = async (medicineIds: string[], optimisticOrder: any[]) => {
        try {
            // Optimistically update the state immediately
            setMedicines(optimisticOrder);

            const response = await fetch('/api/page/medicines/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicineIds }),
            });
            
            if (response.ok) {
                // Reload to get the latest data from server
                await loadMedicines();
            } else {
                // Revert on error
                await loadMedicines();
                throw new Error('Failed to reorder medicines');
            }
        } catch (error) {
            console.error('Error reordering medicines:', error);
            // Reload to revert to server state
            await loadMedicines();
            toast.error('Failed to reorder medicines', {
                description: 'The order has been reverted. Please try again.',
            });
            throw error; // Re-throw so component can handle it
        }
    };

    // Emergency contacts functions
    const loadContacts = async () => {
        try {
            setIsLoadingContacts(true);
            const response = await fetch('/api/page/emergency-contacts');
            if (response.ok) {
                const data = await response.json();
                setContacts(data.contacts || []);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const addContact = async () => {
        if (!newContact.name.trim() || isAddingContact) return;
        try {
            setIsAddingContact(true);
            const response = await fetch('/api/page/emergency-contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContact),
            });
            if (response.ok) {
                setNewContact({ name: '', phone: '', email: '', relation: '' });
                await loadContacts();
                toast.success('Emergency contact added successfully!', {
                    description: `${newContact.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add emergency contact', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error('Error adding emergency contact', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsAddingContact(false);
        }
    };

    const updateContact = async (id: string, contact: any) => {
        try {
            const response = await fetch(`/api/page/emergency-contacts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact),
            });
            if (response.ok) {
                setEditingContact(null);
                loadContacts();
                toast.success('Emergency contact updated successfully!', {
                    description: `${contact.name} has been updated.`,
                });
            } else {
                toast.error('Failed to update emergency contact', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Error updating emergency contact', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    const deleteContact = async (id: string, name: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'contact',
            id,
            name,
            isDeleting: false,
        });
    };

    const confirmDeleteContact = async () => {
        if (!deleteModal.id) return;
        try {
            setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
            const response = await fetch(`/api/page/emergency-contacts/${deleteModal.id}`, { method: 'DELETE' });
            if (response.ok) {
                loadContacts();
                setDeleteModal({ isOpen: false, type: null, id: null, name: '', isDeleting: false });
                toast.success('Emergency contact deleted successfully!', {
                    description: `${deleteModal.name} has been removed from your list.`,
                });
            } else {
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
                toast.error('Failed to delete emergency contact', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            toast.error('Error deleting emergency contact', {
                description: 'An unexpected error occurred.',
            });
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteModal.type === 'medicine') {
            await confirmDeleteMedicine();
        } else if (deleteModal.type === 'allergy') {
            await confirmDeleteAllergy();
        } else if (deleteModal.type === 'diagnosis') {
            await confirmDeleteDiagnosis();
        } else if (deleteModal.type === 'contact') {
            await confirmDeleteContact();
        }
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push('/');
    };

    // Command palette handlers
    const handleCommandPaletteAddMedicine = async (data: { name: string; dosage: string; frequency: string }) => {
        setIsCommandPaletteAdding(true);
        try {
            const response = await fetch('/api/page/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                await loadMedicines();
                toast.success('Medicine added successfully!', {
                    description: `${data.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add medicine', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding medicine:', error);
            toast.error('Error adding medicine', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsCommandPaletteAdding(false);
        }
    };

    const handleCommandPaletteAddAllergy = async (data: {
        name: string;
        reaction: string;
        severity: string;
        isMedicine: boolean;
    }) => {
        setIsCommandPaletteAdding(true);
        try {
            const response = await fetch('/api/page/allergies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                await loadAllergies();
                toast.success('Allergy added successfully!', {
                    description: `${data.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add allergy', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding allergy:', error);
            toast.error('Error adding allergy', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsCommandPaletteAdding(false);
        }
    };

    const handleCommandPaletteAddDiagnosis = async (data: {
        name: string;
        severity: string;
        diagnosisDate: string;
        description: string;
    }) => {
        setIsCommandPaletteAdding(true);
        try {
            const response = await fetch('/api/page/diagnoses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                await loadDiagnoses();
                toast.success('Diagnosis added successfully!', {
                    description: `${data.name} has been added to your list.`,
                });
            } else {
                toast.error('Failed to add diagnosis', {
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Error adding diagnosis:', error);
            toast.error('Error adding diagnosis', {
                description: 'An unexpected error occurred.',
            });
        } finally {
            setIsCommandPaletteAdding(false);
        }
    };

    if (isPending || isCheckingUsername) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        className="mb-4 flex justify-center"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <div className="rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 p-3">
                            <Heart className="h-8 w-8 text-white" fill="white" />
                        </div>
                    </motion.div>
                    <p className="text-lg text-gray-600">Loading...</p>
                </motion.div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80"
                >
                    <p className="text-center text-gray-600 dark:text-gray-300">Not authenticated. Please sign in.</p>
                </motion.div>
            </main>
        );
    }

    // Show onboarding if username is not set
    if (hasUsername === false) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                {/* Animated Gradient Background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-rose-400/40 via-pink-400/40 to-rose-500/40 blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-gradient-to-r from-pink-500/40 via-rose-500/40 to-pink-600/40 blur-3xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.5,
                        }}
                    />
                </div>

                {/* Floating Medical Icons */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[
                        { icon: Heart, x: '10%', y: '20%', delay: 0, color: 'text-pink-200' },
                        { icon: Pill, x: '85%', y: '15%', delay: 0.3, color: 'text-cyan-200' },
                        { icon: Stethoscope, x: '15%', y: '70%', delay: 0.6, color: 'text-emerald-200' },
                        { icon: Activity, x: '90%', y: '75%', delay: 0.9, color: 'text-purple-200' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${item.color}`}
                            style={{ left: item.x, top: item.y }}
                            animate={{
                                y: [0, -30, 0],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: item.delay,
                            }}
                        >
                            <item.icon className="h-12 w-12 md:h-16 md:w-16" />
                        </motion.div>
                    ))}
                </div>

                <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80"
                    >
                        <div className="mb-6 text-center">
                            <motion.div
                                className="mb-4 flex justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 opacity-50 blur-xl" />
                                    <div className="relative rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 p-4">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                            <h2 className="mb-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-3xl font-bold text-transparent dark:from-rose-400 dark:via-pink-400 dark:to-rose-500">
                                Welcome to Medilink! 🎉
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">Let's get you set up with a username to get started.</p>
                        </div>

                        <form onSubmit={handleUsernameSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Choose a Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setUsernameError('');
                                    }}
                                    placeholder="johndoe"
                                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
                                    required
                                    pattern="[a-zA-Z0-9_-]{3,50}"
                                    title="3-50 characters, letters, numbers, underscores, and hyphens only"
                                />
                                {usernameError && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{usernameError}</p>}
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">3-50 characters. Letters, numbers, underscores, and hyphens only.</p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || !username.trim()}
                                className="w-full cursor-pointer bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 hover:shadow-xl hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? 'Setting up...' : 'Continue'}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            {/* Animated Gradient Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-rose-400/40 via-pink-400/40 to-rose-500/40 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-gradient-to-r from-pink-500/40 via-rose-500/40 to-pink-600/40 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400/30 via-pink-400/30 to-rose-500/30 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Floating Medical Icons */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[
                    { icon: Heart, x: '10%', y: '20%', delay: 0, color: 'text-rose-200' },
                    { icon: Pill, x: '85%', y: '15%', delay: 0.3, color: 'text-pink-200' },
                    { icon: Stethoscope, x: '15%', y: '70%', delay: 0.6, color: 'text-rose-200' },
                    { icon: Activity, x: '90%', y: '75%', delay: 0.9, color: 'text-pink-200' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className={`absolute ${item.color}`}
                        style={{ left: item.x, top: item.y }}
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: item.delay,
                        }}
                    >
                        <item.icon className="h-12 w-12 md:h-16 md:w-16" />
                    </motion.div>
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen">
                <DashboardHeader
                    userName={session.user.name || ''}
                    userEmail={session.user.email || ''}
                    userImage={session.user.image || null}
                    onSignOut={handleSignOut}
                    subscriptionTier="free"
                    isAdmin={isAdmin}
                    onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    isMobileMenuOpen={isMobileSidebarOpen}
                    unreadNotificationCount={unreadNotificationCount}
                />

                {/* Main Content Area */}
                <main className="overflow-x-hidden lg:pl-64">
                    <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
                        <DashboardSidebar
                            activeSection={activeSection}
                            onSectionChange={setActiveSection}
                            isMobileOpen={isMobileSidebarOpen}
                            onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        />

                        {/* Content Section */}
                        <div className="w-full">
                                {isLoadingPage ? (
                                    <div className="flex items-center justify-center py-12">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                                            <div className="rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 p-3">
                                                <Heart className="h-6 w-6 text-white" fill="white" />
                                            </div>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {activeSection === 'overview' && (
                                        <>
                                            {/* Welcome Section */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="mb-4 pt-4"
                                            >
                                                <h2 className="mb-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl dark:from-rose-400 dark:via-pink-400 dark:to-rose-500">
                                                    Welcome to Your Dashboard
                                                </h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Manage your medical profile and information.</p>
                                            </motion.div>

                                            {/* Quick Stats Grid */}
                                            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                <div className="group rounded-xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-rose-50/30 p-5 shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:shadow-rose-500/20 dark:border-gray-700/80 dark:from-gray-800 dark:via-gray-800 dark:to-rose-950/30">
                                                    <div className="mb-2 flex items-center gap-2.5">
                                                        <div className="rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 p-1.5 shadow-sm">
                                                            <Pill className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Medicines</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{medicines.length}</p>
                                                </div>
                                                <div className="group rounded-xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-pink-50/30 p-5 shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:shadow-pink-500/20 dark:border-gray-700/80 dark:from-gray-800 dark:via-gray-800 dark:to-pink-950/30">
                                                    <div className="mb-2 flex items-center gap-2.5">
                                                        <div className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 p-1.5 shadow-sm">
                                                            <AlertTriangle className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Allergies</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{allergies.length}</p>
                                                </div>
                                                <div className="group rounded-xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-rose-50/30 p-5 shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:shadow-rose-500/20 dark:border-gray-700/80 dark:from-gray-800 dark:via-gray-800 dark:to-rose-950/30">
                                                    <div className="mb-2 flex items-center gap-2.5">
                                                        <div className="rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 p-1.5 shadow-sm">
                                                            <Stethoscope className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Diagnoses</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{diagnoses.length}</p>
                                                </div>
                                                <div className="group rounded-xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-pink-50/30 p-5 shadow-md backdrop-blur-md transition-all hover:shadow-lg hover:shadow-pink-500/20 dark:border-gray-700/80 dark:from-gray-800 dark:via-gray-800 dark:to-pink-950/30">
                                                    <div className="mb-2 flex items-center gap-2.5">
                                                        <div className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 p-1.5 shadow-sm">
                                                            <Phone className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Contacts</span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{contacts.length}</p>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-rose-50/30 p-6 shadow-lg backdrop-blur-md dark:border-gray-700/80 dark:from-gray-800 dark:via-gray-800 dark:to-rose-950/30">
                                                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Quick Actions</h3>
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    <button
                                                        onClick={() => setActiveSection('page-info')}
                                                        className="group rounded-xl border border-gray-200/80 bg-white p-4 text-left transition-all hover:border-rose-300 hover:bg-gradient-to-br hover:from-rose-50 hover:via-pink-50/30 hover:to-rose-50 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800 dark:hover:border-rose-600 dark:hover:from-rose-950/50 dark:hover:via-pink-950/30 dark:hover:to-rose-950/50"
                                                    >
                                                        <div className="mb-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 p-1.5 w-fit shadow-sm">
                                                            <LayoutDashboard className="h-4 w-4 text-white" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Page Information</p>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Update your profile</p>
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveSection('medicines')}
                                                        className="group rounded-xl border border-gray-200/80 bg-white p-4 text-left transition-all hover:border-rose-300 hover:bg-gradient-to-br hover:from-rose-50 hover:via-pink-50/30 hover:to-rose-50 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800 dark:hover:border-rose-600 dark:hover:from-rose-950/50 dark:hover:via-pink-950/30 dark:hover:to-rose-950/50"
                                                    >
                                                        <div className="mb-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 p-1.5 w-fit shadow-sm">
                                                            <Pill className="h-4 w-4 text-white" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Medicines</p>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Manage medications</p>
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveSection('allergies')}
                                                        className="group rounded-xl border border-gray-200/80 bg-white p-4 text-left transition-all hover:border-rose-300 hover:bg-gradient-to-br hover:from-rose-50 hover:via-pink-50/30 hover:to-rose-50 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800 dark:hover:border-rose-600 dark:hover:from-rose-950/50 dark:hover:via-pink-950/30 dark:hover:to-rose-950/50"
                                                    >
                                                        <div className="mb-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 p-1.5 w-fit shadow-sm">
                                                            <AlertTriangle className="h-4 w-4 text-white" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Allergies</p>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Track allergies</p>
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveSection('qr-code')}
                                                        className="group rounded-xl border border-gray-200/80 bg-white p-4 text-left transition-all hover:border-rose-300 hover:bg-gradient-to-br hover:from-rose-50 hover:via-pink-50/30 hover:to-rose-50 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800 dark:hover:border-rose-600 dark:hover:from-rose-950/50 dark:hover:via-pink-950/30 dark:hover:to-rose-950/50"
                                                    >
                                                        <div className="mb-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 p-1.5 w-fit shadow-sm">
                                                            <QrCode className="h-4 w-4 text-white" />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">QR Code</p>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">View your QR code</p>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                        {activeSection === 'page-info' && (
                                            <PageInformationSection
                                            pageForm={pageForm}
                                            pageData={pageData}
                                            isSavingPage={isSavingPage}
                                            onFormChange={(field, value) => setPageForm({ ...pageForm, [field]: value })}
                                                onSave={savePageData}
                                            />
                                        )}

                                        {activeSection === 'medicines' && (
                                            <MedicinesSection
                                            medicines={medicines}
                                            newMedicine={newMedicine}
                                            editingMedicine={editingMedicine}
                                            editingMedicineData={editingMedicineData}
                                            isAddingMedicine={isAddingMedicine}
                                            onNewMedicineChange={(field, value) => setNewMedicine({ ...newMedicine, [field]: value })}
                                            onAddMedicine={addMedicine}
                                            onEditStart={(medicine) => {
                                                setEditingMedicine(medicine.id);
                                                setEditingMedicineData({
                                                    name: medicine.name,
                                                    dosage: medicine.dosage || '',
                                                    frequency: medicine.frequency || '',
                                                });
                                            }}
                                            onEditCancel={() => {
                                                setEditingMedicine(null);
                                                setEditingMedicineData(null);
                                            }}
                                            onEditChange={(field, value) => setEditingMedicineData({ ...editingMedicineData!, [field]: value })}
                                            onEditSave={(id) => updateMedicine(id, editingMedicineData!)}
                                                onDelete={deleteMedicine}
                                                onReorder={reorderMedicines}
                                            />
                                        )}

                                        {activeSection === 'allergies' && (
                                            <AllergiesSection
                                            allergies={allergies}
                                            newAllergy={newAllergy}
                                            editingAllergy={editingAllergy}
                                            editingAllergyData={editingAllergyData}
                                            isAddingAllergy={isAddingAllergy}
                                            onNewAllergyChange={(field, value) => setNewAllergy({ ...newAllergy, [field]: value } as any)}
                                            onAddAllergy={addAllergy}
                                            onEditStart={(allergy) => {
                                                setEditingAllergy(allergy.id);
                                                setEditingAllergyData({
                                                    name: allergy.name,
                                                    reaction: allergy.reaction || '',
                                                    severity: allergy.severity || 'mild',
                                                    isMedicine: allergy.isMedicine || false,
                                                });
                                            }}
                                            onEditCancel={() => {
                                                setEditingAllergy(null);
                                                setEditingAllergyData({ name: '', reaction: '', severity: 'mild', isMedicine: false });
                                            }}
                                            onEditChange={(field, value) => setEditingAllergyData({ ...editingAllergyData, [field]: value })}
                                            onEditSave={(id) => updateAllergy(id, editingAllergyData)}
                                                onDelete={deleteAllergy}
                                                onReorder={reorderAllergies}
                                            />
                                        )}

                                        {activeSection === 'diagnosis' && (
                                            <DiagnosisSection
                                            diagnoses={diagnoses}
                                            newDiagnosis={newDiagnosis}
                                            editingDiagnosis={editingDiagnosis}
                                            editingDiagnosisData={editingDiagnosisData}
                                            isAddingDiagnosis={isAddingDiagnosis}
                                            onNewDiagnosisChange={(field, value) => setNewDiagnosis({ ...newDiagnosis, [field]: value })}
                                            onAddDiagnosis={addDiagnosis}
                                            onEditStart={(diagnosis) => {
                                                setEditingDiagnosis(diagnosis.id);
                                                setEditingDiagnosisData({
                                                    name: diagnosis.name,
                                                    severity: diagnosis.severity || '',
                                                    diagnosisDate: diagnosis.diagnosisDate ? new Date(diagnosis.diagnosisDate).toISOString().split('T')[0] : '',
                                                    description: diagnosis.description || '',
                                                });
                                            }}
                                            onEditCancel={() => {
                                                setEditingDiagnosis(null);
                                                setEditingDiagnosisData(null);
                                            }}
                                            onEditChange={(field, value) => setEditingDiagnosisData({ ...editingDiagnosisData!, [field]: value })}
                                            onEditSave={(id) => updateDiagnosis(id, editingDiagnosisData!)}
                                            onDelete={deleteDiagnosis}
                                                onReorder={reorderDiagnoses}
                                            />
                                        )}

                                        {activeSection === 'contacts' && (
                                            <EmergencyContactsSection
                                            contacts={contacts}
                                            newContact={newContact}
                                            editingContact={editingContact}
                                            editingContactData={editingContactData}
                                            isAddingContact={isAddingContact}
                                            onNewContactChange={(field, value) => setNewContact({ ...newContact, [field]: value })}
                                            onAddContact={addContact}
                                            onEditStart={(contact) => {
                                                setEditingContact(contact.id);
                                                setEditingContactData({
                                                    name: contact.name,
                                                    phone: contact.phone || '',
                                                    email: contact.email || '',
                                                    relation: contact.relation || '',
                                                });
                                            }}
                                            onEditCancel={() => {
                                                setEditingContact(null);
                                                setEditingContactData(null);
                                            }}
                                            onEditChange={(field, value) => setEditingContactData({ ...editingContactData!, [field]: value })}
                                            onEditSave={(id) => updateContact(id, editingContactData!)}
                                                onDelete={deleteContact}
                                            />
                                        )}

                                        {activeSection === 'qr-code' && pageData?.uniqueKey && (
                                            <QRCodeSection
                                            uniqueKey={pageData.uniqueKey}
                                                pageUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${pageData.uniqueKey}`}
                                            />
                                        )}

                                        {activeSection === 'qr-code' && !pageData?.uniqueKey && (
                                            <div className="rounded-xl border border-gray-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
                                                <QrCode className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                                                <p className="text-gray-600 dark:text-gray-300">Please save your page information first to generate a QR code.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                        </div>
                    </div>
                </main>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                type={deleteModal.type}
                name={deleteModal.name}
                isDeleting={deleteModal.isDeleting}
                onClose={() => setDeleteModal({ isOpen: false, type: null, id: null, name: '', isDeleting: false })}
                onConfirm={handleConfirmDelete}
            />

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onAddMedicine={handleCommandPaletteAddMedicine}
                onAddAllergy={handleCommandPaletteAddAllergy}
                onAddDiagnosis={handleCommandPaletteAddDiagnosis}
                isAdding={isCommandPaletteAdding}
            />
        </main>
    );
}
