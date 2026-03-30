'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import AdminMembershipCards from '@/components/admin/AdminMembershipCards';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SuperAdminDashboard = ({ params }: { params: Promise<{ userId: string }> }) => {
  const resolvedParams = use(params);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams?.get('tab') || 'membership-cards');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    if (user?.role !== 'super_admin') {
      router.push('/unauthorized');
      return;
    }

    // ✅ توحيد الـ URL لو فيه اختلاف في userId
    if (resolvedParams.userId && user?.id && resolvedParams.userId !== user.id) {
      router.replace(`/ar/membership-cards/${user.id}`);
      return;
    }
  }, [isAuthenticated, user, isLoading, router, resolvedParams.userId]);

  // ✅ Sync tab with URL state
  useEffect(() => {
    const tabFromQuery = searchParams?.get('tab');
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [searchParams, activeTab]);

  if (isLoading) {
    return <LoadingSpinner  />;
  }

  if (!isAuthenticated || user?.role !== 'super_admin') return null;

  const tabs = [
    { id: 'membership-cards', name: 'بطاقات العضوية', icon: '💳' }
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
        header={<h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 text-center">لوحة السوبر أدمن</h2>}
        defaultOpen={false}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            لوحة التحكم
          </h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'membership-cards' && <AdminMembershipCards />}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
