'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ViewSwitcherProps {
  isAdmin: boolean;
}

export function ViewSwitcher({ isAdmin }: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const isAdminView = pathname?.startsWith('/admin');
  const isDashboardView = pathname?.startsWith('/dashboard');

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Desktop: Full buttons with text */}
      <div className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200/80 bg-white p-1 shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
        <Button
          variant={isDashboardView ? 'default' : 'ghost'}
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>User View</span>
        </Button>
        <Button
          variant={isAdminView ? 'default' : 'ghost'}
          size="sm"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          <span>Admin View</span>
        </Button>
      </div>
      {/* Mobile: Icon-only buttons */}
      <div className="flex md:hidden items-center gap-1 rounded-lg border border-gray-200/80 bg-white p-1 shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
        <Button
          variant={isDashboardView ? 'default' : 'ghost'}
          size="icon"
          onClick={() => router.push('/dashboard')}
          className="h-8 w-8"
          aria-label="User View"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Button>
        <Button
          variant={isAdminView ? 'default' : 'ghost'}
          size="icon"
          onClick={() => router.push('/admin')}
          className="h-8 w-8"
          aria-label="Admin View"
        >
          <Shield className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

