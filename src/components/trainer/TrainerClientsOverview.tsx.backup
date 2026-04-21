'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/models';
import type { TrainerClientApiResponse } from '@/types/users';
import { apiRequest } from '@/lib/api';
import { UserService } from '@/services/userService';
import { ProgressService } from '@/services/progressService';
import { useRouter, usePathname } from '@/i18n/navigation';
import * as XLSX from 'xlsx';

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

  const formatDate = (val: any): string => {
    if (!val) return '-';
    const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val instanceof Date ? val : null;
    if (!d || isNaN(d.getTime())) return '-';
    return d.toLocaleString('ar-EG');
  };

  const formatDateShort = (val: any): string => {
    if (!val) return '-';
    const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val instanceof Date ? val : null;
    if (!d || isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('ar-EG');
  };

  const calcAge = (dob: any): string => {
    if (!dob) return '-';
    const d = new Date(dob);
    if (isNaN(d.getTime())) return '-';
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return String(Math.abs(ageDt.getUTCFullYear() - 1970));
  };

  const calcBMI = (weightKg?: number, heightCm?: number): string => {
    if (!weightKg || !heightCm) return '-';
    const h = heightCm / 100;
    const bmi = weightKg / (h * h);
    return bmi ? bmi.toFixed(1) : '-';
  };

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

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'معلق'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-gray-500';
    return 'bg-red-500';
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Helper to export filteredClients to Excel
  const handleExport = () => {
    // Prepare data for export (same fields as grid)
    const data = filteredClients.map(client => ({
      'الاسم': client.name,
      'البريد الإلكتروني': client.email,
      'رقم الهاتف': client.phone || '-',
      'الحالة': getStatusText(client.status),
      'بداية الاشتراك': formatDateShort((client as any).subscriptionStartDate),
      'نهاية الاشتراك': formatDateShort((client as any).subscriptionEndDate),
      'الوزن (ابتدائي)': (client as any).baselineWeightKg ?? '-',
      'الوزن المستهدف': (client as any).targetWeightKg ?? '-',
      'الطول (سم)': (client as any).heightCm ?? (client as any).metadata?.heightCm ?? '-',
      'العمر': calcAge(client.dob),
      'نقاط الولاء': client.loyaltyPoints,
      'Freeze Days': (client as any).subscriptionFreezeDays ?? 0,
      'Freeze Used': (client as any).subscriptionFreezeUsed ?? 0,
      'الأهداف': client.goals && Object.entries(client.goals).filter(([_, v]) => v).map(([k]) => k === 'weightLoss' ? 'تخسيس' : k === 'muscleGain' ? 'بناء عضلات' : k === 'endurance' ? 'قوة تحمل' : k).join(', ') || 'لا يوجد أهداف',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'clients_export.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
            عملائي
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors mb-2 sm:mb-0"
            >
              تصدير البيانات
            </button>
            <input
              type="text"
              placeholder="البحث عن عميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="banned">محظور</option>
            </select>
          </div>
        </div>
      </div>
      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">جاري التحميل...</div>
        ) : error ? (
          <div className="col-span-full text-center text-red-600 py-8">{error}</div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-8">لا يوجد عملاء</div>
        ) : filteredClients.map((client) => (
          <div
            key={client._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
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
              <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors" onClick={() => openViewClient(client._id)}>
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
        ))}
      </div>
      {/* Client Details Modal */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsViewOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
            <div className="relative flex flex-col items-center mb-6 mt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="absolute top-2 left-2 md:left-auto md:right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
                aria-label="إغلاق"
              >
                ×
              </button>
              {viewUser?.avatarUrl ? (
                <img src={viewUser.avatarUrl} alt={viewUser?.name || 'User'} className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow mb-2" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-3xl font-bold mb-2">
                  {viewUser?.name ? viewUser.name.charAt(0) : '?'}
                </div>
              )}
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{viewUser?.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{viewUser?.email}</div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">بيانات العميل</h4>
            {viewLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : viewUser && !viewUser.error ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  {userViewFields.map(({ key, label, type }) => {
                    const value = (viewUser as any)[key as any];
                    if (
                      typeof value === 'undefined' ||
                      value === '' ||
                      value === null ||
                      Array.isArray(value) ||
                      (typeof value === 'object' && value !== null && Object.keys(value).length === 0) ||
                      key === 'dob' ||
                      key === '__v'
                    ) return null;

                    if (type === 'date') {
                      return (
                        <div key={String(key)} className="flex flex-col border-b pb-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                          <span className="text-gray-900 dark:text-white break-all">{formatDate(value)}</span>
                        </div>
                      );
                    }

                    if (type === 'goals') {
                      const entries = value && typeof value === 'object' ? Object.entries(value).filter(([_, v]) => v) : [];
                      return (
                        <div key={String(key)} className="flex flex-col border-b pb-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entries.length > 0 ? (
                              entries.map(([k], idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                                  {k === 'weightLoss' ? 'تخسيس' : k === 'muscleGain' ? 'بناء عضلات' : k === 'endurance' ? 'قوة تحمل' : k}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">لا يوجد أهداف</span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (type === 'object' && typeof value === 'object' && value !== null) {
                      const filtered = Object.entries(value).filter(([k]) => k !== 'lastLogin' && k !== 'ipAddress');
                      if (filtered.length === 0) return null;
                      return (
                        <div key={String(key)} className="flex flex-col border-b pb-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                          <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                            {filtered.map(([k, v]) => (
                              <div key={k} className="flex justify-between border-b last:border-b-0 py-1">
                                <span className="text-gray-600 dark:text-gray-400">{k}</span>
                                <span className="text-gray-900 dark:text-white">{v === true ? '✔️' : v === false ? '❌' : (v === null || v === undefined || typeof v === 'object' ? '-' : String(v))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={String(key)} className="flex flex-col border-b pb-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</span>
                        <span className="text-gray-900 dark:text-white break-all">
                          {value === true ? '✔️' : value === false ? '❌' : value}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* قسم بيانات المستخدم */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">بيانات المستخدم</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">العمر:</span>
                      <span className="text-gray-900 dark:text-white">{calcAge(viewUser?.dob)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الوزن (آخر قياس):</span>
                      <span className="text-gray-900 dark:text-white">{viewProgress?.weight ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">نسبة الدهون (آخر قياس):</span>
                      <span className="text-gray-900 dark:text-white">{viewProgress?.bodyFat ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الطول (من metadata إن وجد):</span>
                      <span className="text-gray-900 dark:text-white">{viewUser?.metadata?.heightCm ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">BMI:</span>
                      <span className="text-gray-900 dark:text-white">{calcBMI(viewProgress?.weight, viewUser?.metadata?.heightCm)}</span>
                    </div>
                    {viewProgress?.measurements && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">القياسات:</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs">
                          {Object.entries(viewProgress.measurements).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 px-2 py-1">
                              <span className="text-gray-600 dark:text-gray-400">{k}</span>
                              <span className="text-gray-900 dark:text-white">{(v === null || v === undefined || typeof v === 'object') ? '-' : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-red-600 py-8">{viewUser?.error || 'تعذر جلب البيانات'}</div>
            )}
            <div className="flex items-center justify-center gap-3 pt-6">
              <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClientsOverview;
