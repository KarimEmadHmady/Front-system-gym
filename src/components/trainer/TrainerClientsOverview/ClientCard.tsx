'use client';

import React from 'react';
import { useRouter } from '@/i18n/navigation';

interface ClientCardProps {
  client: any;
  formatDateShort: (val: any) => string;
  calcAge: (dob: any) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onViewDetails: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  formatDateShort,
  calcAge,
  getStatusColor,
  getStatusText,
  onViewDetails
}) => {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {client.avatarUrl ? (
            <img 
              src={client.avatarUrl} 
              alt={client.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold ${client.avatarUrl ? 'hidden' : ''}`}
            style={{ display: client.avatarUrl ? 'none' : 'flex' }}
          >
            {client.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{client.name}</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{client.email}</p>
          </div>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
          {getStatusText(client.status)}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">بداية الاشتراك:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDateShort((client as any).subscriptionStartDate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">نهاية الاشتراك:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDateShort((client as any).subscriptionEndDate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">الوزن (ابتدائي):</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{(client as any).baselineWeightKg ?? '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">الوزن المستهدف:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{(client as any).targetWeightKg ?? '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">الطول (سم):</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{(client as any).heightCm ?? (client as any).metadata?.heightCm ?? '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">العمر:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{calcAge(client.dob)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">رقم الهاتف:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{client.phone || '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">نقاط الولاء:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{client.loyaltyPoints}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Freeze Days:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{(client as any).subscriptionFreezeDays ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Freeze Used:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{(client as any).subscriptionFreezeUsed ?? 0}</span>
        </div>
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">الأهداف:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {client.goals && Object.entries(client.goals).filter(([_, v]) => v).length > 0 ? (
              Object.entries(client.goals).filter(([_, v]) => v).map(([k], idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                  {k === 'weightLoss' ? 'تخسيس' : k === 'muscleGain' ? 'بناء عضلات' : k === 'endurance' ? 'قوة تحمل' : k}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">لا يوجد أهداف</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex space-x-2">
        <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors" onClick={() => onViewDetails(client._id)}>
          عرض التفاصيل
        </button>
        <button
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => router.push('/trainer/dashboard?tab=messages')}
        >
          إرسال رسالة
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
