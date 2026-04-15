'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

// Components
import ManagerStatsCards from '@/components/manager/ManagerStatsCards';
import ManagerQuickActions from '@/components/manager/ManagerQuickActions';
import ManagerRecentActivity from '@/components/manager/ManagerRecentActivity';
import ManagerUsersTable from '@/components/manager/ManagerUsersTable';
import AdminPlansOverview from '@/components/admin/AdminPlansOverview';
import AdminAttendance from '@/components/admin/AdminAttendance';
import AdminPayments from '@/components/admin/AdminPayments';
import AdminPurchases from '@/components/admin/AdminPurchases';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminProgress from '@/components/admin/AdminProgress';
import AdminLoyalty from '@/components/admin/AdminLoyalty';
import ManagerSettings from '@/components/manager/ManagerSettings';
import TrainersDirectory from '@/components/shared/TrainersDirectory';
import ManagerFeedback from '@/components/manager/ManagerFeedback';
import ManagerInvoices from '@/components/manager/ManagerInvoices';
import AdminSessionsOverview from '@/components/admin/AdminSessionsOverview';
import SubscriptionAlertIndicator from '@/components/admin/SubscriptionAlertIndicator';
import SubscriptionAlertBadge from '@/components/admin/SubscriptionAlertBadge';
import SubscriptionAlertsSummary from '@/components/admin/SubscriptionAlertsSummary';
import SoundManager from '@/components/admin/SoundManager';
import { useWhatsAppActions } from '@/hooks/useWhatsApp';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import ManagerReports from '@/components/manager/ManagerReports';
import ManagerAttendanceScanner from '@/components/manager/ManagerAttendanceScanner';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { FeatureBanner } from '@/components/ui/FeatureBanner';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
const ManagerAddExpense = dynamic(() => import('@/components/manager/ManagerAddExpense'), { ssr: false });
const ManagerAddRevenue = dynamic(() => import('@/components/manager/ManagerAddRevenue'), { ssr: false });

const ManagerDashboard = ({ params }: { params: Promise<{ userId: string }> }) => {
  const resolvedParams = use(params);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('ManagerDashboard');
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams?.get('tab') || 'overview');
  const { triggerExpiryCheck } = useWhatsAppActions();
  const hasTriggeredRef = useRef(false);

  // يمكنك استخدام userId هنا لجلب بيانات أو التحقق

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/'); 
      return;
    }

    if (user?.role !== 'manager') {
      router.push('/unauthorized');
      return;
    }
    // إعادة التوجيه إذا كان userId في الرابط لا يساوي user.id
    if (resolvedParams.userId && user?.id && resolvedParams.userId !== user.id) {
      router.replace(`/ar/manager/dashboard/${user.id}`);
      return;
    }
  }, [isAuthenticated, user, isLoading, router, resolvedParams.userId]);

  // WhatsApp auto-check for expiring subscriptions
  useEffect(() => {
    // Only run once when component mounts and user is authenticated manager
    if (isAuthenticated && user?.role === 'manager' && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      console.log("🔍 Manager Dashboard: Checking for expiring subscriptions automatically...");
      
      triggerExpiryCheck({ useQueue: true })
        .then((res: any) => {
          console.log("✅ Manager auto-check done:", res);
          
          if (res?.success) {
            if (res.queueStatus) {
              const queued = res.queueStatus.queue || 0;
              const completed = res.queueStatus.completed || 0;
              
              if (completed > 0) {
                console.log(`📱 Manager: Sent ${completed} expiring notifications automatically`);
              }
              if (queued > 0) {
                console.log(`⏳ Manager: Queued ${queued} expiring notifications for processing`);
              }
            } else if (res.data) {
              const sent = res.data.sent || 0;
              if (sent > 0) {
                console.log(`📱 Manager: Sent ${sent} expiring notifications automatically`);
              }
            }
          }
        })
        .catch(err => {
          console.error("❌ Manager auto-check failed:", err);
        });
    }
  }, [isAuthenticated, user]);

  // Sync activeTab with URL changes
  useEffect(() => {
    const tabFromQuery = searchParams?.get('tab');
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [searchParams, activeTab]);

  if (isLoading) {
    return <LoadingSpinner  />;
  }

  if (!isAuthenticated || user?.role !== 'manager') {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: '📊' },
    { id: 'users', name: 'المستخدمين', icon: '👥', showAlert: true },
    { id: 'trainers', name: 'المدربون', icon: '👨‍🏫' },
    { id: 'sessions', name: 'الحصص', icon: '🏋️' },
    { id: 'plans', name: 'الخطط', icon: '📋' },
    { id: 'reports', name: 'التقارير', icon: '📈' },
    { id: 'attendance', name: 'الحضور', icon: '📝' },
    { id: 'attendance-log', name: 'سجل الحضور', icon: '🧾' },
    { id: 'payments', name: 'مدفوعات', icon: '💵' },
    { id: 'invoices', name: 'الفواتير', icon: '🧾' },
    { id: 'add-expense', name: 'إضافة مصروف', icon: '💸' },
    { id: 'add-revenue', name: 'إضافة دخل', icon: '💰' },
    { id: 'purchases', name: 'مشتريات', icon: '🛒' },
    { id: 'messages', name: 'رسائل', icon: '✉️' },
    { id: 'progress', name: 'تقدم العملاء', icon: '📈' },
    { id: 'feedback', name: 'التقييمات', icon: '⭐' },
    { id: 'loyalty', name: 'نقاط الولاء', icon: '🎁' },
    // { id: 'membership-cards', name: 'بطاقات العضوية', icon: '🪪' },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️' },
    // { id: 'search', name: 'بحث', icon: '🔎' },

  ];

  // زر تبديل اللغة
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const handleLocaleSwitch = () => {
    const paramsString = searchParams?.toString() || '';
    const pathWithQuery = paramsString ? `${pathname}?${paramsString}` : pathname;
    router.push(pathWithQuery, { locale: otherLocale });
  };

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
        header={<h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 text-center">لوحة التحكم</h2>}
        defaultOpen={false}
      />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0 mr-0 sm:mr-10 xl:mr-0">
          <div className="w-full sm:w-auto text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                لوحة التحكم المدير
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                مرحباً بك، {user?.name}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 sm:space-x-4">
            <div className="flex flex-row sm:flex-row items-center space-x-3">
            <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  مدير
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div className="flex  items-center space-x-3">
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
{/*               <button
                onClick={handleLocaleSwitch}
                aria-label="تغيير اللغة"
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors ml-0 sm:ml-2"
              >
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z" />
                </svg>
                <span className="hidden sm:inline">تغيير اللغة</span>
              </button> */}
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
                    ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.showAlert && <SubscriptionAlertBadge className="ml-2" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Subscription Alert Indicator (global, fetch-once) */}
      <SubscriptionAlertIndicator />
      
      {/* Sound Manager */}
      <SoundManager activeTab={activeTab} />

{/* Main Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {activeTab === 'overview' && (
    <div className="space-y-8">
      <ManagerStatsCards />
      <ManagerQuickActions />
      <ManagerRecentActivity />
    </div>
  )}

  {activeTab === 'users' && (
    <FeatureGate feature="users" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <SubscriptionAlertsSummary />
        <ManagerUsersTable />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'trainers' && (
    <div className="space-y-8">
      <TrainersDirectory scope="manager" />
    </div>
  )}

  {activeTab === 'sessions' && (
    <FeatureGate feature="schedules" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminSessionsOverview />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'plans' && (
    <FeatureGate feature="workoutPlans" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminPlansOverview />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'reports' && (
    <ManagerReports />
  )}

  {activeTab === 'attendance' && (
    <FeatureGate feature="attendance" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminAttendance />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'attendance-log' && (
    <FeatureGate feature="attendanceScan" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <ManagerAttendanceScanner params={{ userId: user!.id }} />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'payments' && (
    <FeatureGate feature="payments" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminPayments />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'invoices' && (
    <FeatureGate feature="financial" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <ManagerInvoices />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'add-expense' && (
    <FeatureGate feature="financial" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <ManagerAddExpense />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'add-revenue' && (
    <FeatureGate feature="financial" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <ManagerAddRevenue />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'purchases' && (
    <FeatureGate feature="purchases" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminPurchases />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'messages' && (
    <FeatureGate feature="messages" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminMessages />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'progress' && (
    <FeatureGate feature="clientProgress" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminProgress />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'feedback' && (
    <FeatureGate feature="feedback" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <ManagerFeedback />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'loyalty' && (
    <FeatureGate feature="loyaltyPoints" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <AdminLoyalty />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'settings' && (
    <FeatureGate feature="gymSettings" fallback={<FeatureBanner type="locked" role="manager"  />}>
      <div className="space-y-8">
        <ManagerSettings />
      </div>
    </FeatureGate>
  )}
</div>
    </div>
  );
};

export default ManagerDashboard;
