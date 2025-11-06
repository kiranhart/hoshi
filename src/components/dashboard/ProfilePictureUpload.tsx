'use client';

import { useCallback, useRef, useState } from 'react';

import { Camera, Loader2, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useUploadThing } from '@/lib/uploadthing';

interface ProfilePictureUploadProps {
    currentImageUrl: string | null;
    onImageUpdate: (newImageUrl: string | null) => void;
}

export function ProfilePictureUpload({ currentImageUrl, onImageUpdate }: ProfilePictureUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: session } = authClient.useSession();

    const { startUpload, isUploading: isUploadThingUploading } = useUploadThing('profilePicture', {
        onClientUploadComplete: async (res) => {
            if (!res || res.length === 0) {
                toast.error('Upload failed');
                setIsUploading(false);
                setPreview(null);
                return;
            }

            const newImageUrl = res[0].url;
            // Extract file key from current image URL if it's from uploadthing
            let oldImageKey: string | null = null;
            if (currentImageUrl && currentImageUrl.includes('utfs.io')) {
                const keyMatch = currentImageUrl.split('/f/')[1]?.split('?')[0];
                if (keyMatch) {
                    oldImageKey = keyMatch;
                }
            }

            try {
                const response = await fetch('/api/user/profile-picture', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrl: newImageUrl,
                        oldImageKey: oldImageKey,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update profile picture');
                }

                // Update the UI - session will refresh automatically on next render
                onImageUpdate(newImageUrl);
                setPreview(null);
                toast.success('Profile picture updated successfully!');
            } catch (error: any) {
                console.error('Error updating profile picture:', error);
                toast.error(error.message || 'Failed to update profile picture');
            } finally {
                setIsUploading(false);
            }
        },
        onUploadError: (error: Error) => {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload image');
            setIsUploading(false);
            setPreview(null);
        },
    });

    const validateFile = (file: File): boolean => {
        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return false;
        }

        // Check file size (4MB)
        const maxSize = 4 * 1024 * 1024; // 4MB in bytes
        if (file.size > maxSize) {
            toast.error('File size must be less than 4MB');
            return false;
        }

        return true;
    };

    const handleFile = useCallback(
        (file: File) => {
            if (!validateFile(file)) {
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Start upload
            setIsUploading(true);
            startUpload([file]);
        },
        [startUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFile(file);
            }
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [handleFile]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = async () => {
        if (!currentImageUrl) return;

        // Confirm deletion
        if (!confirm('Are you sure you want to delete your profile picture?')) {
            return;
        }

        try {
            setIsDeleting(true);
            console.log('Deleting profile picture:', currentImageUrl);

            const response = await fetch('/api/user/profile-picture', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete profile picture');
            }

            console.log('Delete response:', data);

            // Update the UI - session will refresh automatically on next render
            onImageUpdate(null);
            toast.success('Profile picture deleted successfully!');
        } catch (error: any) {
            console.error('Error deleting profile picture:', error);
            toast.error(error.message || 'Failed to delete profile picture');
        } finally {
            setIsDeleting(false);
        }
    };

    const displayImage = preview || currentImageUrl;
    const isLoading = isUploading || isDeleting || isUploadThingUploading;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Profile Picture Display */}
            <div className="relative flex-shrink-0">
                <div
                    className={`relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-2 transition-all ${
                        isDragging ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200'
                    } ${isLoading ? 'pointer-events-none opacity-50' : 'hover:border-cyan-300'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    {displayImage ? (
                        <img src={displayImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500">
                            <span className="text-3xl font-semibold text-white">{session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                    )}

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}

                    {!isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all hover:bg-black/20">
                            <div className="rounded-full bg-white/90 p-2 opacity-0 shadow-lg transition-opacity hover:opacity-100">
                                <Camera className="h-5 w-5 text-gray-700" />
                            </div>
                        </div>
                    )}

                    {isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20">
                            <div className="rounded-lg bg-white p-3 shadow-xl">
                                <Upload className="h-8 w-8 text-cyan-600" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" disabled={isLoading} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:justify-center">
                <Button type="button" onClick={handleClick} disabled={isLoading} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Camera className="mr-2 h-4 w-4" />
                    {currentImageUrl ? 'Change Picture' : 'Upload Picture'}
                </Button>

                {currentImageUrl && (
                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                )}

                {preview && !isLoading && (
                    <Button
                        type="button"
                        onClick={() => {
                            setPreview(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 sm:w-auto"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
}
