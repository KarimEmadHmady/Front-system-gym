'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getRoleBasedRedirect } from '@/middleware/auth';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  fallbackPath
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading, wait

    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    // Check role permissions
    if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
      const redirectPath = fallbackPath || getRoleBasedRedirect(user.role as UserRole);
      router.push(redirectPath);
      return;
    }

    // Check specific permissions
    if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
      const redirectPath = fallbackPath || getRoleBasedRedirect(user?.role as UserRole);
      router.push(redirectPath);
      return;
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, requiredPermissions, fallbackPath, hasPermission, hasRole, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  // Check role permissions
  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return null;
  }

  // Check specific permissions
  if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
    return null;
  }

  return <>{children}</>;
};

// Higher-order component for protecting pages
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    allowedRoles?: UserRole[];
    requiredPermissions?: string[];
    fallbackPath?: string;
  }
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute
        allowedRoles={options?.allowedRoles}
        requiredPermissions={options?.requiredPermissions}
        fallbackPath={options?.fallbackPath}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
