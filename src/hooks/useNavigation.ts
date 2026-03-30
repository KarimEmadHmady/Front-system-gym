import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { ROLE_NAVIGATION } from '@/lib/constants';
import type { NavigationItem, UserRole } from '@/types';

export const useNavigation = () => {
  const { hasPermission, userRole } = usePermissions();

  // Filter navigation items based on permissions
  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter(item => {
        // If no permissions required, show item
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        
        // Check if user has any of the required permissions
        return item.permissions.some(permission => hasPermission(permission));
      })
      .map(item => ({
        ...item,
        children: item.children ? filterNavigationItems(item.children) : undefined
      }))
      .filter(item => {
        // Remove items with no children if they have children property
        if (item.children && item.children.length === 0) {
          return false;
        }
        return true;
      });
  };

  // Get navigation items for current user role
  const navigationItems = useMemo(() => {
    if (!userRole) return [];
    
    const roleNavigation = ROLE_NAVIGATION[userRole];
    if (!roleNavigation) return [];
    
    return filterNavigationItems(roleNavigation);
  }, [userRole, hasPermission]);

  // Get breadcrumb items for current path
  const getBreadcrumbs = (pathname: string): NavigationItem[] => {
    const breadcrumbs: NavigationItem[] = [];
    
    // Find the navigation item that matches the current path
    const findNavigationItem = (items: NavigationItem[], path: string): NavigationItem | null => {
      for (const item of items) {
        if (item.href === path) {
          return item;
        }
        
        if (item.children) {
          const found = findNavigationItem(item.children, path);
          if (found) {
            breadcrumbs.unshift(item); // Add parent to breadcrumbs
            return found;
          }
        }
      }
      return null;
    };
    
    const currentItem = findNavigationItem(navigationItems, pathname);
    if (currentItem) {
      breadcrumbs.push(currentItem);
    }
    
    return breadcrumbs;
  };

  // Get active navigation item
  const getActiveItem = (pathname: string): NavigationItem | null => {
    const findActiveItem = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.href === pathname) {
          return item;
        }
        
        if (item.children) {
          const found = findActiveItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findActiveItem(navigationItems);
  };

  // Check if navigation item is active
  const isActiveItem = (item: NavigationItem, pathname: string): boolean => {
    if (item.href === pathname) return true;
    
    if (item.children) {
      return item.children.some(child => isActiveItem(child, pathname));
    }
    
    return false;
  };

  return {
    navigationItems,
    getBreadcrumbs,
    getActiveItem,
    isActiveItem,
    userRole
  };
};
