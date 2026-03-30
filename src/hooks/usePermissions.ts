import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ROLE_PERMISSIONS } from '@/lib/constants';
import type { UserRole } from '@/types';

export const usePermissions = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(user?.role as UserRole);
  };

  // Get user's permissions
  const getUserPermissions = (): string[] => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role as UserRole] || [];
  };

  // Check if user can access route
  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    // Define route permissions mapping
    const routePermissions: Record<string, string[]> = {
      '/admin/users': ['users:read'],
      '/admin/attendance': ['attendance:read'],
      '/admin/financial': ['financial:read'],
      '/admin/plans': ['workout:read', 'diet:read'],
      '/admin/feedback': ['feedback:read'],
      '/admin/messages': ['messages:read'],
      '/admin/reports': ['reports:read'],
      '/admin/loyalty': ['loyalty:read'],
      '/trainer/clients': ['users:read'],
      '/trainer/attendance': ['attendance:read'],
      '/trainer/plans': ['workout:read', 'diet:read'],
      '/trainer/progress': ['progress:read'],
      '/trainer/feedback': ['feedback:read'],
      '/trainer/messages': ['messages:read'],
      '/member/profile': ['profile:read'],
      '/member/progress': ['progress:read'],
      '/member/attendance': ['attendance:read'],
      '/member/workout': ['workout:read'],
      '/member/diet': ['diet:read'],
      '/member/feedback': ['feedback:write'],
      '/member/messages': ['messages:read'],
      '/member/loyalty': ['loyalty:read'],
      '/member/payments': ['payment:read']
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // No specific permissions required

    return hasAnyPermission(requiredPermissions);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    getUserPermissions,
    canAccessRoute,
    user,
    isAuthenticated,
    userRole: user?.role as UserRole
  };
};
