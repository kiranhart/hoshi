// Reusable hook for CRUD operations on entities

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EntityType } from '@/lib/types';

interface UseEntityCrudOptions<T> {
    entityType: EntityType;
    entityName: string;
    apiBasePath: string;
    onSuccess?: () => void;
}

export function useEntityCrud<T extends { id: string; name: string }>({
    entityType,
    entityName,
    apiBasePath,
    onSuccess,
}: UseEntityCrudOptions<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<Partial<T> | null>(null);

    const loadItems = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(apiBasePath);
            if (response.ok) {
                const data = await response.json();
                const itemsKey = `${entityType}s` as keyof typeof data;
                setItems((data[itemsKey] || []) as T[]);
            }
        } catch (error) {
            console.error(`Error loading ${entityName}s:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [apiBasePath, entityName, entityType]);

    const addItem = useCallback(
        async (itemData: Omit<T, 'id'>) => {
            if (!itemData.name?.trim() || isAdding) return;
            try {
                setIsAdding(true);
                const response = await fetch(apiBasePath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData),
                });
                if (response.ok) {
                    await loadItems();
                    toast.success(`${entityName} added successfully!`, {
                        description: `${itemData.name} has been added to your list.`,
                    });
                    onSuccess?.();
                } else {
                    toast.error(`Failed to add ${entityName}`, {
                        description: 'Please try again.',
                    });
                }
            } catch (error) {
                console.error(`Error adding ${entityName}:`, error);
                toast.error(`Error adding ${entityName}`, {
                    description: 'An unexpected error occurred.',
                });
            } finally {
                setIsAdding(false);
            }
        },
        [apiBasePath, entityName, isAdding, loadItems, onSuccess]
    );

    const updateItem = useCallback(
        async (id: string, itemData: Partial<T>) => {
            try {
                const response = await fetch(`${apiBasePath}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData),
                });
                if (response.ok) {
                    setEditingId(null);
                    setEditingData(null);
                    await loadItems();
                    toast.success(`${entityName} updated successfully!`, {
                        description: `${itemData.name || 'Item'} has been updated.`,
                    });
                } else {
                    toast.error(`Failed to update ${entityName}`, {
                        description: 'Please try again.',
                    });
                }
            } catch (error) {
                console.error(`Error updating ${entityName}:`, error);
                toast.error(`Error updating ${entityName}`, {
                    description: 'An unexpected error occurred.',
                });
            }
        },
        [apiBasePath, entityName, loadItems]
    );

    const deleteItem = useCallback(
        async (id: string) => {
            try {
                const response = await fetch(`${apiBasePath}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    await loadItems();
                    toast.success(`${entityName} deleted successfully!`, {
                        description: 'Item has been removed from your list.',
                    });
                } else {
                    toast.error(`Failed to delete ${entityName}`, {
                        description: 'Please try again.',
                    });
                }
            } catch (error) {
                console.error(`Error deleting ${entityName}:`, error);
                toast.error(`Error deleting ${entityName}`, {
                    description: 'An unexpected error occurred.',
                });
            }
        },
        [apiBasePath, entityName, loadItems]
    );

    const startEdit = useCallback((item: T) => {
        setEditingId(item.id);
        setEditingData({ ...item });
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditingData(null);
    }, []);

    return {
        items,
        isLoading,
        isAdding,
        editingId,
        editingData,
        loadItems,
        addItem,
        updateItem,
        deleteItem,
        startEdit,
        cancelEdit,
        setEditingData,
    };
}

