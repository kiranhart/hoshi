// Shared edit and delete button components

import { Check, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditDeleteButtonsProps {
    onEdit: () => void;
    onDelete: () => void;
    editClassName?: string;
    deleteClassName?: string;
}

export function EditDeleteButtons({ onEdit, onDelete, editClassName, deleteClassName }: EditDeleteButtonsProps) {
    return (
        <div className="flex items-start gap-1.5 pt-1">
            <Button
                onClick={onEdit}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 cursor-pointer text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 ${editClassName || ''}`}
            >
                <Edit2 className="h-4 w-4" />
            </Button>
            <Button
                onClick={onDelete}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 cursor-pointer text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 ${deleteClassName || ''}`}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

interface SaveCancelButtonsProps {
    onSave: () => void;
    onCancel: () => void;
    saveClassName?: string;
    cancelClassName?: string;
}

export function SaveCancelButtons({ onSave, onCancel, saveClassName, cancelClassName }: SaveCancelButtonsProps) {
    return (
        <div className="flex gap-2">
            <Button
                onClick={onSave}
                variant="ghost"
                size="icon"
                className={`cursor-pointer text-green-500 hover:bg-green-50 hover:text-green-600 ${saveClassName || ''}`}
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                onClick={onCancel}
                variant="ghost"
                size="icon"
                className={`cursor-pointer text-gray-400 hover:text-gray-600 ${cancelClassName || ''}`}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

