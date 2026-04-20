import React from 'react';
import type { RewardsStatsResponse, LoyaltyPointsStatsResponse } from '@/types';

interface Props {
  loyaltyStats: LoyaltyPointsStatsResponse | null;
  rewardsStats: RewardsStatsResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

const LoyaltyStats: React.FC<Props> = ({ loyaltyStats, rewardsStats, loading, onRefresh }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500">إجمالي المستخدمين</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {loyaltyStats?.stats.totalUsers || 0}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500">إجمالي النقاط</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {loyaltyStats?.stats.totalPoints || 0}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500">إجمالي الاستبدالات</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {rewardsStats?.general.totalRedemptions || 0}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-sm text-gray-500">إجمالي المكافآت</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {rewardsStats?.general.totalRewards || 0}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyStats;
