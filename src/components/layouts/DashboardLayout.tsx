'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';
import { usePermissions } from '@/hooks/usePermissions';
import { DASHBOARD_CONFIGS } from '@/lib/constants';
import { useTranslations, useLocale } from 'next-intl';
import type { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { navigationItems, getBreadcrumbs, isActiveItem } = useNavigation();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('DashboardLayout');

  const userRole = user?.role as UserRole;
  const dashboardConfig = DASHBOARD_CONFIGS[userRole];
  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // زر تبديل اللغة
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const handleLocaleSwitch = () => {
    console.log('DashboardLayout - Current pathname:', pathname);
    console.log('DashboardLayout - Current locale:', locale);
    console.log('DashboardLayout - Other locale:', otherLocale);
    router.push(pathname, { locale: otherLocale });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">
            {dashboardConfig?.title || 'Dashboard'}
          </h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveItem(item, pathname)
                      ? 'bg-gray-100 text-gray-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">
                    {item.icon === 'dashboard' && '📊'}
                    {item.icon === 'users' && '👥'}
                    {item.icon === 'calendar' && '📅'}
                    {item.icon === 'dollar-sign' && '💰'}
                    {item.icon === 'clipboard-list' && '📋'}
                    {item.icon === 'message-square' && '💬'}
                    {item.icon === 'mail' && '📧'}
                    {item.icon === 'bar-chart' && '📈'}
                    {item.icon === 'star' && '⭐'}
                    {item.icon === 'user' && '👤'}
                    {item.icon === 'trending-up' && '📈'}
                    {item.icon === 'dumbbell' && '🏋️'}
                    {item.icon === 'utensils' && '🍽️'}
                    {item.icon === 'credit-card' && '💳'}
                  </span>
                  {item.label}
                </a>
                
                {/* Submenu */}
                {item.children && item.children.length > 0 && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                            isActiveItem(child, pathname)
                              ? 'bg-gray-50 text-gray-600'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <span className="mr-2">🚪</span>
            {t('Logout.btn')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Breadcrumbs */}
              <nav className="hidden md:flex ml-4">
                <ol className="flex items-center space-x-2">
                  <li>
                    <a href="/dashboard" className="text-gray-500 hover:text-gray-700">
                      Dashboard
                    </a>
                  </li>
                  {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.href} className="flex items-center">
                      <span className="mx-2 text-gray-400">/</span>
                      <a
                        href={crumb.href}
                        className={`${
                          index === breadcrumbs.length - 1
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {crumb.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Switch */}
              <button
                onClick={handleLocaleSwitch}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {t('Language.btn')}
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                </svg>
              </button>
              
              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
