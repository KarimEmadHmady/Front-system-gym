'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/models';
import type { TrainerClientApiResponse } from '@/types/users';
import { apiRequest } from '@/lib/api';
import { UserService } from '@/services/userService';
import { ProgressService } from '@/services/progressService';
import { useRouter, usePathname } from '@/i18n/navigation';

// Import extracted components
import ClientsHeader from './ClientsHeader';
import ClientCard from './ClientCard';
import ClientDetailsModal from './ClientDetailsModal';
import { formatDate, formatDateShort, calcAge, calcBMI, getStatusColor, getStatusText, handleExport } from './utils';

const TrainerClientsOverview = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/trainer/dashboard';
  const currentTrainerId = useMemo(() => ((user as any)?._id ?? user?.id ?? ''), [user]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewUser, setViewUser] = useState<User | any>(null);
  const [viewProgress, setViewProgress] = useState<any>(null);

  const userService = new UserService();
  const progressService = new ProgressService();

  const userViewFields: { key: keyof User | string; label: string; type?: 'object' | 'goals' | 'date' }[] = [
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'phone', label: 'رقم الهاتف' },
    { key: 'avatarUrl', label: 'رابط الصورة' },
    { key: 'address', label: 'العنوان' },
    { key: 'balance', label: 'الرصيد' },
    { key: 'status', label: 'الحالة' },
    // أخفينا failedLoginAttempts و isDeleted
    { key: 'subscriptionStartDate', label: 'بداية الاشتراك', type: 'date' },
    { key: 'subscriptionEndDate', label: 'نهاية الاشتراك', type: 'date' },
    { key: 'subscriptionRenewalReminderSent', label: 'تذكير التجديد', type: 'date' },
    { key: 'lastPaymentDate', label: 'آخر دفعة', type: 'date' },
    { key: 'nextPaymentDueDate', label: 'استحقاق الدفع القادم', type: 'date' },
    { key: 'subscriptionFreezeDays', label: 'أيام تجميد الاشتراك' },
    { key: 'subscriptionFreezeUsed', label: 'أيام التجميد المستخدمة' },
    { key: 'subscriptionStatus', label: 'حالة الاشتراك' },
    { key: 'loyaltyPoints', label: 'نقاط الولاء' },
    { key: 'membershipLevel', label: 'مستوى العضوية' },
    { key: 'goals', label: 'الأهداف', type: 'goals' },
    { key: 'metadata', label: 'بيانات إضافية', type: 'object' },
    { key: 'createdAt', label: 'تاريخ الإنشاء', type: 'date' },
    { key: 'updatedAt', label: 'آخر تعديل', type: 'date' },
  ];

  const openViewClient = async (id: string) => {
    setIsViewOpen(true);
    setViewLoading(true);
    setViewUser(null);
    setViewProgress(null);
    try {
      const [u, p] = await Promise.all([
        userService.getUser(id),
        progressService.getLatestProgress(id).catch(() => null)
      ]);
      setViewUser(u);
      setViewProgress(p);
    } catch {
      setViewUser({ error: 'تعذر جلب بيانات العميل' });
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const userService = new UserService();
        const membersRes: any = await userService.getUsersByRole('member', { page: 1, limit: 1000 });
        const arr = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
        const normalizeId = (val: any): string => {
          if (!val) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'object') return (val._id || val.id || '') as string;
          return String(val);
        };
        const me = normalizeId(currentTrainerId);
        const filtered = (arr || []).filter((m: any) => normalizeId(m?.trainerId) === me);
        setClients(filtered);
      } catch (err: any) {
        setError('تعذر جلب العملاء');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [currentTrainerId]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ClientsHeader
        onExport={() => handleExport(filteredClients)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error ? (
          <div className="col-span-full text-center text-red-600 py-8">{error}</div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-8">لا يوجد عملاء</div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              formatDateShort={formatDateShort}
              calcAge={calcAge}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onViewDetails={openViewClient}
            />
          ))
        )}
      </div>

      {/* Client Details Modal */}
      <ClientDetailsModal
        isViewOpen={isViewOpen}
        viewLoading={viewLoading}
        viewUser={viewUser}
        viewProgress={viewProgress}
        userViewFields={userViewFields}
        formatDate={formatDate}
        calcAge={calcAge}
        calcBMI={calcBMI}
        onClose={() => setIsViewOpen(false)}
      />
    </div>
  );
};

export default TrainerClientsOverview;
