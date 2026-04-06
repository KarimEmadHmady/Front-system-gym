'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

// Components
import MemberProfileHeader from '@/components/member/MemberProfileHeader';
import MemberStatsCards from '@/components/member/MemberStatsCards';
import MemberQuickActions from '@/components/member/MemberQuickActions';
import MemberSessionsHistory from '@/components/member/MemberSessionsHistory';
import MemberPlansOverview from '@/components/member/MemberPlansOverview';
import MemberProgressTracking from '@/components/member/MemberProgressTracking';
import MemberLoyaltyPoints from '@/components/member/MemberLoyaltyPoints';
import MemberAttendance from '@/components/member/MemberAttendance';
import MemberPayments from '@/components/member/MemberPayments';
import MemberSubscription from '@/components/member/MemberSubscription';
import MemberPurchases from '@/components/member/MemberPurchases';
import MemberTrainer from '@/components/member/MemberTrainer';
import MemberMessages from '@/components/member/MemberMessages';
import MemberMessagesChat from '@/components/member/MemberMessagesChat';
import MemberSettings from '@/components/member/MemberSettings';
import MemberFeedback from '@/components/member/MemberFeedback';
import DashboardSidebar from '@/components/ui/DashboardSidebar';
import { messageService } from '@/services';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { FeatureBanner } from '@/components/ui/FeatureBanner';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

const MemberProfile = ({ params }: { params: Promise<{ barcode: string }> }) => {
  const resolvedParams = use(params);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('MemberProfile');
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams?.get('tab') || 'overview');
  const [chatMode, setChatMode] = useState(() => searchParams?.get('chatMode') !== 'false');
  const [unreadMessages, setUnreadMessages] = useState(0);

  // يمكنك استخدام userId هنا لجلب بيانات أو التحقق

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user?.role !== 'member') {
      router.push('/unauthorized');
      return;
    }
    // إعادة التوجيه إذا كان userId في الرابط لا يساوي user.id
    if (resolvedParams.barcode && user?.barcode && resolvedParams.barcode !== user.barcode) {
      router.replace(`/member/profile/${user.barcode}`);
      return;
    }
  }, [isAuthenticated, user, isLoading, router, resolvedParams.barcode]);

  // Sync activeTab with URL changes
  useEffect(() => {
    const tabFromQuery = searchParams?.get('tab');
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [searchParams, activeTab]);

  // Fetch unread messages count for sidebar/top tabs alert
  useEffect(() => {
    let isMounted = true;
    const normalizeId = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return (val._id || val.id || '') as string;
      return String(val);
    };
    const load = async () => {
      try {
        const currentId = normalizeId(user?.id || (user as any)?._id);
        if (!currentId) {
          if (isMounted) setUnreadMessages(0);
          return;
        }
        const msgs: any[] = await messageService.getMessagesForUser(currentId);
        const unread = (msgs || []).filter((m) => !m.read && normalizeId(m.userId) === currentId);
        if (isMounted) setUnreadMessages(unread.length);
      } catch {
        if (isMounted) setUnreadMessages(0);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner  />;
  }

  if (!isAuthenticated || user?.role !== 'member') {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: '📊' },
    { id: 'subscription', name: 'الاشتراك', icon: '📅' },
    { id: 'attendance', name: 'الحضور', icon: '📝' },
    { id: 'plans', name: 'الخطط', icon: '📋' },
    { id: 'payments', name: 'مدفوعات', icon: '💵' },
    { id: 'loyalty', name: 'نقاط الولاء', icon: '🎁' },
    { id: 'purchases', name: 'مشتريات', icon: '🛒' },
    { id: 'progress', name: 'التقدم', icon: '📈' },
    { id: 'sessions', name: 'الحصص', icon: '🏋️' },
    { id: 'trainer', name: 'مدربي', icon: '👨‍🏫' },
    { id: 'messages', name: 'الرسائل', icon: '💬', showAlert: unreadMessages > 0 },
    { id: 'feedback', name: 'التقييمات', icon: '⭐' },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️' }
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

  const toggleChatMode = () => {
    const newChatMode = !chatMode;
    setChatMode(newChatMode);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newChatMode) {
      params.delete('chatMode'); // Chat mode is now default, so remove the parameter
    } else {
      params.set('chatMode', 'false'); // Only set parameter when switching to normal view
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen theme-gradient-bg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
                بروفايل العضوية
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
                  عضو
                </p>
              </div>
              {(user as any)?.avatarUrl ? (
                <img 
                  src={(user as any).avatarUrl} 
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold ${(user as any)?.avatarUrl ? 'hidden' : ''}`}
                style={{ display: (user as any)?.avatarUrl ? 'none' : 'flex' }}
              >
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
                <span className="relative mr-2 inline-flex items-center">
                  {tab.icon}
                  {tab.id === 'messages' && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </span>
                <span className="inline-flex items-center">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

{/* Main Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {activeTab === 'overview' && (
    <div className="space-y-8">
      <MemberProfileHeader />
      <MemberQuickActions />
      <MemberStatsCards />
    </div>
  )}

  {activeTab === 'attendance' && (
    <FeatureGate feature="attendance" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberAttendance />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'payments' && (
    <FeatureGate feature="payments" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberPayments />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'subscription' && (
    <div className="space-y-8">
      <MemberSubscription />
    </div>
  )}

  {activeTab === 'purchases' && (
    <FeatureGate feature="purchases" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberPurchases />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'sessions' && (
    <FeatureGate feature="schedules" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberSessionsHistory />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'plans' && (
    <FeatureGate feature="workoutPlans" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberPlansOverview />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'trainer' && (
    <div className="space-y-8">
      <MemberTrainer />
    </div>
  )}

  {activeTab === 'messages' && (
    <FeatureGate feature="messages" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <div className="flex justify-end mb-4">
          <button onClick={toggleChatMode} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chatMode ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
            {chatMode ? '📋 تعديل و حذف الرسايل' : '💬 عرض الشات'}
          </button>
        </div>
        {chatMode ? <MemberMessagesChat /> : <MemberMessages />}
      </div>
    </FeatureGate>
  )}

  {activeTab === 'feedback' && (
    <FeatureGate feature="feedback" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberFeedback />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'progress' && (
    <FeatureGate feature="clientProgress" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberProgressTracking />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'loyalty' && (
    <FeatureGate feature="loyaltyPoints" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberLoyaltyPoints />
      </div>
    </FeatureGate>
  )}

  {activeTab === 'settings' && (
    <FeatureGate feature="gymSettings" fallback={<FeatureBanner type="coming" role="member" />}>
      <div className="space-y-8">
        <MemberSettings />
      </div>
    </FeatureGate>
  )}
</div>
    </div>
  );
};

export default MemberProfile;