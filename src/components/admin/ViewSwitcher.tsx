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
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
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
  );
}

