import React from 'react';

interface FinancialReportProps {
  financialSummary: {
    monthly: Array<{
      year: number;
      month: number;
      revenue: number;
      expense: number;
      netProfit: number;
      payroll: number;
    }>;
  } | null;
  financialLoading: boolean;
  financialError: string | null;
  payrollData: {
    totalPayroll: number;
  } | null;
}

const FinancialReport: React.FC<FinancialReportProps> = ({
  financialSummary,
  financialLoading,
  financialError,
  payrollData
}) => {
  // المالية: سنعرض ملخص الشهر الحالي فقط (يمكنك تطويره لاحقاً)
  let financialData = null;
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
      {financialLoading ? (
        <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
      ) : financialError ? (
        <div className="text-center py-8 text-red-600">{financialError}</div>
      ) : !financialData ? (
        <div className="text-center py-8 text-gray-500">لا توجد بيانات مالية متاحة</div>
      ) : (
        <>
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">الإيرادات</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ج.م{financialData.monthly.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{financialData.monthly.growth}% من الشهر الماضي
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">المصروفات</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ج.م{financialData.monthly.expenses.toLocaleString()}
              </p>
              {/* لا يوجد نمو المصروفات في الداتا الحقيقية هنا */}
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">الربح الصافي</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                ج.م{financialData.monthly.profit.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">الرواتب</h4>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                ج.م{(payrollData?.totalPayroll || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي رواتب الموظفين
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReport;
