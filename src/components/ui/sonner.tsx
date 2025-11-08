'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme } = useTheme();
    
    return (
        <Sonner
            theme={theme as 'light' | 'dark' | 'system'}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-md dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-gray-700',
                    description: 'group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400',
                    actionButton: 'group-[.toast]:bg-gradient-to-r group-[.toast]:from-rose-500 group-[.toast]:via-pink-500 group-[.toast]:to-rose-500 group-[.toast]:text-white group-[.toast]:shadow-lg group-[.toast]:shadow-rose-500/30',
                    cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-300',
                    success: 'group-[.toaster]:bg-white group-[.toaster]:border-green-200 group-[.toaster]:text-green-900 dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:border-green-800 dark:group-[.toaster]:text-green-300',
                    error: 'group-[.toaster]:bg-white group-[.toaster]:border-red-200 group-[.toaster]:text-red-900 dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:border-red-800 dark:group-[.toaster]:text-red-300',
                    info: 'group-[.toaster]:bg-white group-[.toaster]:border-cyan-200 group-[.toaster]:text-cyan-900 dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:border-cyan-800 dark:group-[.toaster]:text-cyan-300',
                    warning: 'group-[.toaster]:bg-white group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-900 dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:border-amber-800 dark:group-[.toaster]:text-amber-300',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };

