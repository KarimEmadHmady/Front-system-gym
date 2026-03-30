import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/api';
import type { UserRole } from '@/types';

// Role-based route protection
export function withAuth(handler: Function, allowedRoles?: UserRole[]) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Verify token and get user data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      const user = await response.json();

      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      // Add user to request
      (req as any).user = user;
      
      return handler(req, ...args);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  };
}

// Role-based route matcher
export function createRoleBasedMatcher() {
  return {
    // Admin routes
    admin: [
      '/admin/:path*',
      '/dashboard'
    ],
    // Trainer routes
    trainer: [
      '/trainer/:path*',
      '/dashboard'
    ],
    // Member routes
    member: [
      '/member/:path*',
      '/dashboard'
    ],
    // Manager routes
    manager: [
      '/manager/:path*',
      '/dashboard'
    ]
  };
}

// Get user role from token
export async function getUserRole(token: string): Promise<UserRole | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// Check if user has permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const { ROLE_PERMISSIONS } = require('@/lib/constants');
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

// Get redirect URL based on role
export function getRoleBasedRedirect(role: UserRole): string {
  const roleRedirects = {
    admin: '/admin/dashboard',
    trainer: '/trainer/dashboard', 
    member: '/member/profile',
    manager: '/manager/dashboard',
    accountant: '/accountant/dashboard',
    super_admin: '/membership-cards'
  };
  
  return roleRedirects[role] || '/dashboard';
}
