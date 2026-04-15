'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

// Components

import AdminFinancialOverview from '@/components/admin/AdminFinancialOverview';
import AdminPayments from '@/components/admin/AdminPayments';
import AdminSearch from '@/components/admin/AdminSearch';
import AdminRevenue from '@/components/admin/AdminRevenue';
import AdminExpenses from '@/components/admin/AdminExpenses';
import AdminInvoices from '@/components/admin/AdminInvoices';
import AdminPayroll from '@/components/admin/AdminPayroll';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

const AccountantDashboard = ({ params }: { params: Promise<{ userId: string }> }) => {
  const resolvedParams = use(params);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('AccountantDashboard');
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams?.get('tab') || 'search');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
    router.push('/');
      return;
    }
    if (user?.role !== 'accountant') {
      router.push('/unauthorized');
      return;
    }
    // إعادة التوجيه إذا كان userId في الرابط لا يساوي user.id
    if (resolvedParams.userId && user?.id && resolvedParams.userId !== user.id) {
      router.replace(`/ar/accountant/dashboard/${user.id}`);
      return;
    }
  }, [isAuthenticated, user, isLoading, router, resolvedParams.userId]);

  // Keep state in sync if URL query changes externally
  useEffect(() => {
    const tabFromQuery = searchParams?.get('tab');
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [searchParams, activeTab]);

  if (isLoading) {
    return <LoadingSpinner  />;
  }

  if (!isAuthenticated || user?.role !== 'accountant') {
    return null;
  }

  const tabs = [
      { id: 'search', name: 'البحث المتقدم', icon: '🔎' },
    { id: 'financial', name: 'التقارير المالية', icon: '💰' },
    { id: 'revenue', name: 'الإيرادات', icon: '💵' },
    { id: 'expenses', name: 'المصروفات', icon: '💸' },
    { id: 'invoices', name: 'الفواتير', icon: '🧾' },
    { id: 'payroll', name: 'الرواتب', icon: '👥' },
    { id: 'payments', name: 'المدفوعات', icon: '💳' },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen theme-gradient-bg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <DashboardSidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        header={<h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 text-center">لوحة المحاسب</h2>}
        defaultOpen={false}
      />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0 mr-0 sm:mr-10 xl:mr-0">
            <div className="w-full sm:w-auto text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                لوحة تحكم المحاسب
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                مرحباً، {user?.name}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 sm:space-x-4">
              <div className="flex flex-row sm:flex-row items-center space-x-3">
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    محاسب
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggleButton />
                <button
                  onClick={logout}
                  aria-label="تسجيل الخروج"
                  className="bg-red-600 hover:bg-red-700 text-white p-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-0 sm:space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap mb-4 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
      {activeTab === 'search' && (
          <div className="space-y-8">
            <AdminSearch />
          </div>
        )}

        
        {activeTab === 'financial' && (
          <div className="space-y-8">
            <AdminFinancialOverview />
          </div>
        )}


        {activeTab === 'revenue' && (
          <div className="space-y-8">
            <AdminRevenue />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-8">
            <AdminExpenses />
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-8">
            <AdminInvoices />
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="space-y-8">
            <AdminPayroll />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8">
            <AdminPayments />
          </div>
        )}


      </div>
    </div>
  );
};

export default AccountantDashboard;
