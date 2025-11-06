'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-md',
                    description: 'group-[.toast]:text-gray-600',
                    actionButton: 'group-[.toast]:bg-gradient-to-r group-[.toast]:from-teal-500 group-[.toast]:via-cyan-500 group-[.toast]:to-blue-500 group-[.toast]:text-white group-[.toast]:shadow-lg group-[.toast]:shadow-cyan-500/30',
                    cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700',
                    success: 'group-[.toaster]:bg-white group-[.toaster]:border-green-200 group-[.toaster]:text-green-900',
                    error: 'group-[.toaster]:bg-white group-[.toaster]:border-red-200 group-[.toaster]:text-red-900',
                    info: 'group-[.toaster]:bg-white group-[.toaster]:border-cyan-200 group-[.toaster]:text-cyan-900',
                    warning: 'group-[.toaster]:bg-white group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-900',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };

