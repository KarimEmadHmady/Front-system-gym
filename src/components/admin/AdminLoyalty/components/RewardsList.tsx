import React from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import type { RedeemableReward } from '@/types';

interface Props {
  rewards: RedeemableReward[];
  loading: boolean;
  onAddReward: () => void;
  onEditReward: (reward: RedeemableReward) => void;
  onDeleteReward: (id: string) => void;
}

const RewardsList: React.FC<Props> = ({
  rewards, loading, onAddReward, onEditReward, onDeleteReward
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">إدارة المكافآت</h3>
        <button
          onClick={onAddReward}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          إضافة مكافأة جديدة
        </button>
      </div>

      {loading && <div className="text-center py-4 text-gray-500">جاري التحميل...</div>}
      {!loading && rewards.length === 0 && (
        <div className="text-center py-8 text-gray-500">لا توجد مكافآت</div>
      )}

      {!loading && rewards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{reward.name}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  reward.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {reward.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{reward.description}</p>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">النقاط المطلوبة:</span>
                  <span className="font-medium">{reward.pointsRequired}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المخزون:</span>
                  <span className="font-medium">{reward.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">القيمة:</span>
                  <span className="font-medium">{reward.value} {reward.valueUnit}</span>
                </div>
                {reward.validUntil && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">صالححية حتى:</span>
                    <span className="font-medium">{new Date(reward.validUntil).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onEditReward(reward)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  <Edit className="w-3 h-3" />
                  تعديل
                </button>
                <button
                  onClick={() => onDeleteReward(reward._id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash className="w-3 h-3" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsList;
