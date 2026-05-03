// Header.tsx — استبدل الملف كله

'use client';

import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  userId: string;
  role: 'admin' | 'manager';
}

const Header: React.FC<HeaderProps> = ({ userId, role }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    const base = role === 'admin' ? 'admin' : 'manager';
    router.push(`/${base}/dashboard/${user?.id ?? userId}`);
  };

  const handleNewTab = () => {
    const base = role === 'admin' ? 'admin' : 'manager';
    window.open(`/${base}/dashboard/${user?.id ?? userId}`, '_blank');
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* زرار الرجوع — نفس التاب */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
        <span className="hidden sm:inline">العودة للوحة التحكم</span>
      </button>

      {/* ✅ FIX: ExternalLink بدل ArrowRight عشان يوضح إنه بيفتح تاب جديد */}
      <button
        onClick={handleNewTab}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        <span className="hidden sm:inline">فتح لوحة التحكم في تاب جديد</span>
      </button>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          ماسح الحضور
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          امسح باركود الأعضاء لتسجيل الحضور
        </p>
      </div>
    </div>
  );
};

export default Header;