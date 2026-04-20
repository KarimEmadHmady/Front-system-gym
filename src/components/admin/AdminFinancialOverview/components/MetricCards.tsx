import React from 'react';

interface MetricItem {
  monthly: number;
  growth: number;
}

interface MetricCardsProps {
  metrics: {
    revenue: MetricItem;
    expenses: MetricItem;
    profit: MetricItem;
  };
}

const MetricCard = ({
  label,
  value,
  growth,
  icon,
  colorClass,
  gradientClass,
}: {
  label: string;
  value: number;
  growth: number;
  icon: string;
  colorClass: string;
  gradientClass: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>ج.م{value.toLocaleString()}</p>
        <p className={`text-sm ${colorClass}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% من الشهر الماضي
        </p>
      </div>
      <div className={`w-12 h-12 ${gradientClass} rounded-lg flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
    </div>
  </div>
);

const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricCard
      label="الإيرادات الشهرية"
      value={metrics.revenue.monthly}
      growth={metrics.revenue.growth}
      icon="💰"
      colorClass="text-green-600 dark:text-green-400"
      gradientClass="bg-gradient-to-r from-green-500 to-green-600"
    />
    <MetricCard
      label="المصروفات الشهرية"
      value={metrics.expenses.monthly}
      growth={metrics.expenses.growth}
      icon="💸"
      colorClass="text-red-600 dark:text-red-400"
      gradientClass="bg-gradient-to-r from-red-500 to-red-600"
    />
    <MetricCard
      label="صافي الربح الشهري"
      value={metrics.profit.monthly}
      growth={metrics.profit.growth}
      icon="📈"
      colorClass="text-gray-600 dark:text-gray-400"
      gradientClass="bg-gradient-to-r from-gray-500 to-gray-600"
    />
  </div>
);

export default MetricCards;