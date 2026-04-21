'use client';

import React from 'react';

interface FinancialData {
  monthly: {
    revenue: number;
    expenses: number;
    profit: number;
    payroll: number;
    growth: string;
  };
}

interface FinancialReportProps {
  financialSummary: any;
  financialLoading: boolean;
  financialError: string | null;
  payrollData: any;
  payrollLoading: boolean;
  payrollError: string | null;
}

const FinancialReport: React.FC<FinancialReportProps> = ({
  financialSummary,
  financialLoading,
  financialError,
  payrollData,
  payrollLoading,
  payrollError
}) => {
  // حساب الإحصائيات
  let financialData: FinancialData | null = null;
  if (financialSummary && financialSummary.monthly && financialSummary.monthly.length > 0) {
    const latest = financialSummary.monthly[financialSummary.monthly.length - 1];
    const prev = financialSummary.monthly.length > 1 ? financialSummary.monthly[financialSummary.monthly.length - 2] : null;
    const growth = prev ? (((latest.revenue - prev.revenue) / (prev.revenue || 1)) * 100).toFixed(1) : '0';
    financialData = {
      monthly: {
        revenue: latest.revenue || 0,
        expenses: latest.expense || 0,
        profit: latest.netProfit || 0,
        payroll: latest.payroll || 0,
        growth: growth,
      },
    };
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التقارير المالية</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* إجمالي الرواتب */}
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">إجمالي الرواتب</h4>
          {payrollLoading ? (
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">جاري التحميل...</div>
          ) : payrollError ? (
            <div className="text-xl font-bold text-red-600 dark:text-red-400">خطأ</div>
          ) : payrollData ? (
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">ج.م{payrollData.totalPayroll || 0}</div>
          ) : (
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">0</div>
          )}
        </div>

        {/* ملخص الشهر */}
        {financialData && (
          <>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">إيرادات الشهر</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">ج.م{financialData.monthly.revenue}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">المصروفات الشهر</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">ج.م{financialData.monthly.expenses}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">الربح الصافي</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">ج.م{financialData.monthly.profit}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">نمو الإيرادات</h4>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {financialData.monthly.growth === '0' ? '0%' : `${financialData.monthly.growth}%`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* رسائل الخطأ */}
      {financialError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">خطأ في تحميل البيانات المالية</h4>
          <p className="text-sm text-red-600 dark:text-red-400">{financialError}</p>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
