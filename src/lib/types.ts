// Shared types used across the application

export interface Medicine {
    id: string;
    name: string;
    dosage: string | null;
    frequency: string | null;
    displayOrder: number;
}

export interface Allergy {
    id: string;
    name: string;
    reaction: string | null;
    severity: string;
    isMedicine: boolean;
    displayOrder: number;
}

export interface Diagnosis {
    id: string;
    name: string;
    severity: string | null;
    diagnosisDate: string | null;
    description: string | null;
    displayOrder: number;
}

export interface EmergencyContact {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    relation: string | null;
}

export type EntityType = 'medicine' | 'allergy' | 'diagnosis' | 'contact';

export interface DeleteModalState {
    isOpen: boolean;
    type: EntityType | null;
    id: string | null;
    name: string;
    isDeleting: boolean;
}

