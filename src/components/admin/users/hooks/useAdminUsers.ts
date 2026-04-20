'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { UserService } from '@/services/userService';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import { getSubscriptionAlertService } from '@/services/subscriptionAlertService';

export const useAdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [hasPlayedAlert, setHasPlayedAlert] = useState(false);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const latestFetchRef = useRef(0);

  const userService = useMemo(() => new UserService(), []);
  const { hasPermission, user: currentUser } = usePermissions();
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchUsersPage = async () => {
      setLoading(true);
      setListError(null);
      const fetchId = Date.now();
      latestFetchRef.current = fetchId;
      try {
        const params = { page: currentPage, limit: PAGE_SIZE } as any;
        const res =
          filterRole && filterRole !== 'all'
            ? await userService.getUsersByRole(filterRole, params)
            : await userService.getUsers(params);

        const usersArr: UserModel[] = (res as any)?.data || [];
        const pagination = (res as any)?.pagination || {};
        const total = Number(pagination.total ?? 0);
        const tPages = Number(pagination.totalPages ?? 1);

        // Prevent stale/double effect runs from overwriting state
        if (latestFetchRef.current === fetchId) {
          setUsers(usersArr);
          setTotalUsers(total);
          setTotalPages(tPages || 1);
        }
      } catch (err) {
        if (latestFetchRef.current === fetchId) {
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(1);
        }
        const message =
          err instanceof Error ? err.message : 'Failed to fetch users. Please check login and permissions.';
        setListError(message);
      } finally {
        if (latestFetchRef.current === fetchId) {
          setLoading(false);
        }
      }
    };
    fetchUsersPage();
  }, [refresh, userService, currentPage, filterRole]);

  useEffect(() => {
    // Run subscription alerts check once after users are available
    if (hasPlayedAlert) return;
    if (users.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const alerts = await getSubscriptionAlertService().getSubscriptionAlerts();
        const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
        if (!cancelled && criticalAlerts.length > 0) {
          setHasPlayedAlert(true);
        }
      } catch {
        // ignore alert errors; shouldn't block users list
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [users.length, hasPlayedAlert]);

  // Search is applied locally to current page only (server-side search can be added later)
  const visibleUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, searchTerm]);

  const getRoleText = (role: string) => {
    const roles = { member: 'Member', trainer: 'Trainer', admin: 'Admin', manager: 'Manager' };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = { 
      member: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', 
      trainer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
      manager: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = { 
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
      banned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionColor = (subscription: string) => {
    const colors = { 
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
    };
    return colors[subscription as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const safeUsers = Array.isArray(visibleUsers) ? visibleUsers : [];

  return {
    // State
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    currentPage,
    setCurrentPage,
    loading,
    listError,
    refresh,
    setRefresh,
    users,
    totalUsers,
    totalPages,
    safeUsers,
    
    // Utilities
    hasPermission,
    currentUser,
    PAGE_SIZE,
    getRoleText,
    getRoleColor,
    getStatusColor,
    getSubscriptionColor,
  };
};
