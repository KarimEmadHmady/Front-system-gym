'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import CustomAlert from '@/components/ui/CustomAlert';
import VideoTutorial from '@/components/VideoTutorial';

import MetricCards from './components/MetricCards';
import TransactionsTab from './components/TransactionsTab';
import ReportsTab from './components/ReportsTab';
import { useFinancialMetrics } from './hooks/useFinancialMetrics';
import { useTransactions } from './hooks/useTransactions';

// lazy-loaded tabs (unchanged)
const AdminInvoices  = dynamic(() => import('../AdminInvoices'),  { ssr: false });
const AdminPayroll   = dynamic(() => import('../AdminPayroll'),   { ssr: false });
const AdminRevenue   = dynamic(() => import('../AdminRevenue'),   { ssr: false });
const AdminExpenses  = dynamic(() => import('../AdminExpenses/AdminExpenses'),  { ssr: false });

const TABS = [
  { id: 'transactions', name: 'المعاملات الأخيرة', shortName: 'المعاملات', icon: '💳' },
  { id: 'reports',      name: 'التقارير',           shortName: 'التقارير',  icon: '📈' },
  { id: 'invoices',     name: 'الفواتير',           shortName: 'الفواتير',  icon: '🧾' },
  { id: 'payroll',      name: 'الرواتب',            shortName: 'الرواتب',   icon: '🧑‍💼' },
  { id: 'revenue',      name: 'الإيرادات',          shortName: 'الإيرادات', icon: '💹' },
  { id: 'expenses',     name: 'المصروفات',          shortName: 'المصروفات', icon: '💸' },
];

const AdminFinancialOverview = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const { alertState, showSuccess, showError, hideAlert } = useCustomAlert();
  const { metrics } = useFinancialMetrics();
  const transactions = useTransactions();

  const handleExport = async () => {
    const result = await transactions.exportToExcel();
    if (result.success) showSuccess('تم التصدير بنجاح', 'تم تصدير المعاملات المالية بنجاح');
    else showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير المعاملات المالية');
  };

  return (
    <div className="space-y-6">
      <VideoTutorial
        videoId="iJnZkG_QDGQ"
        title="إزاي تتابع كل العمليات المالية لحظة بلحظة وتتحكم في كل التفاصيل من مكان واحد"
        position="bottom-right"
        buttonText="شرح"
      />

      {/* Metric summary cards */}
      <MetricCards metrics={metrics} />

      {/* Tabs container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">

        {/* Tab navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Desktop */}
          <nav className="hidden md:flex space-x-8 px-6 mb-[85px]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-500 text-gray-600 dark:text-gray-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>{tab.name}
              </button>
            ))}
          </nav>

          {/* Mobile */}
          <div className="md:hidden overflow-x-auto hide-scrollbar w-full pb-3">
            <nav className="flex sm:flex-row flex-col space-x-2 px-4 py-2 min-w-max flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 py-2 px-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap rounded-t-lg ${
                    activeTab === tab.id
                      ? 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="mr-1 text-sm">{tab.icon}</span>
                  <span className="text-xs">{tab.shortName}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'transactions' && (
            <TransactionsTab
              loading={transactions.loading}
              error={transactions.error}
              paginatedTransactions={transactions.paginatedTransactions}
              recentTransactions={transactions.recentTransactions}
              currentPage={transactions.currentPage}
              pageCount={transactions.pageCount}
              startIndex={transactions.startIndex}
              endIndex={transactions.endIndex}
              userMap={transactions.userMap}
              onPageChange={transactions.setCurrentPage}
              onRefresh={transactions.loadRecentTransactions}
              onExport={handleExport}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              userMap={transactions.userMap}
              onSuccess={showSuccess}
              onError={showError}
            />
          )}

          {activeTab === 'invoices'  && <AdminInvoices />}
          {activeTab === 'payroll'   && <AdminPayroll />}
          {activeTab === 'revenue'   && <AdminRevenue />}
          {activeTab === 'expenses'  && <AdminExpenses />}
        </div>
      </div>

      <CustomAlert
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
      />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminFinancialOverview;