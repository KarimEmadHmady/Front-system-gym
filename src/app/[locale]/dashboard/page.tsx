'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getRoleBasedRedirect } from '@/middleware/auth';
import type { UserRole } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    // Redirect to role-specific dashboard
    if (user) {
      const redirectPath = getRoleBasedRedirect(user.role as UserRole, user.id);
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner  />;
  }

  return null;
};

export default DashboardPage;
