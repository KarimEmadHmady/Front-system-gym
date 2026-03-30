'use client';

import React, { useEffect, useState } from 'react';
import { LoyaltyService } from '@/services/loyaltyService';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/models';
import { 
  Search, 
  Users, 
  Star, 
  Plus, 
  TrendingUp, 
  Calendar,
  Award,
  Gift,
  Target,
  History
} from 'lucide-react';

const loyaltyService = new LoyaltyService();
const userService = new UserService();

const TrainerLoyaltyPoints = () => {
  const { user: currentUser } = useAuth();
  const currentTrainerId = currentUser?.id;

  // State
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [clientPointsHistory, setClientPointsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // جلب عملاء الترينر
  useEffect(() => {
    const fetchClients = async () => {
      console.log('Current user:', currentUser);
      console.log('Current trainer ID:', currentTrainerId);
      
      if (!currentTrainerId) {
        setError('لم يتم العثور على معرف المدرب');
        setLoading(false);
        return;
      }

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
        console.log('Current trainer ID:', me);
        console.log('All members:', arr.length);
        
        const filtered = (arr || []).filter((m: any) => {
          const memberTrainerId = normalizeId(m?.trainerId);
          console.log('Member:', m.name, 'Trainer ID:', memberTrainerId, 'Match:', memberTrainerId === me);
          return memberTrainerId === me;
        });
        
        console.log('Filtered clients:', filtered.length);
        setClients(filtered);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError('تعذر جلب العملاء');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [currentTrainerId]);

  // جلب سجل نقاط العميل المحدد
  const fetchClientPointsHistory = async (clientId: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await loyaltyService.getUserPointHistory(clientId, {});
      setClientPointsHistory(res?.history || []);
    } catch (err: any) {
      setHistoryError('تعذر جلب سجل النقاط');
    } finally {
      setHistoryLoading(false);
    }
  };

  // فلترة العملاء حسب البحث
  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      (client.name || '').toLowerCase().includes(search) ||
      (client.email || '').toLowerCase().includes(search) ||
      (client.phone || '').toLowerCase().includes(search)
    );
  });

  // معالجة اختيار عميل
  const handleClientSelect = (client: User) => {
    setSelectedClient(client);
    const clientId = (client as any)._id || (client as any).id;
    fetchClientPointsHistory(clientId);
  };

  // إضافة نقاط للعميل
  const handleAddPoints = async (clientId: string, points: number, reason: string) => {
    try {
      await loyaltyService.addPoints(clientId, points, reason);
      // تحديث سجل النقاط
      if (selectedClient && ((selectedClient as any)._id === clientId || (selectedClient as any).id === clientId)) {
        fetchClientPointsHistory(clientId);
      }
      // تحديث قائمة العملاء
      setClients(prev => prev.map(client => {
        const clientIdToCheck = (client as any)._id || (client as any).id;
        return clientIdToCheck === clientId 
          ? { ...client, loyaltyPoints: (client.loyaltyPoints || 0) + points }
          : client;
      }));
    } catch (err: any) {
      console.error('خطأ في إضافة النقاط:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">{error}</div>
          <div className="text-sm text-gray-500">
            {!currentTrainerId && 'تأكد من تسجيل الدخول بشكل صحيح'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">نقاط الولاء - عملائي</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">إدارة نقاط الولاء للعملاء المخصصين لك</p>
          </div>
        </div>
        
        {/* البحث */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث بالاسم أو الهاتف أو الإيميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* قائمة العملاء */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">قائمة العملاء</h4>
            <span className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
              {filteredClients.length}
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">لا يوجد عملاء</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientId = (client as any)._id || (client as any).id;
              const isSelected = selectedClient && ((selectedClient as any)._id === clientId || (selectedClient as any).id === clientId);
              return (
                <div
                  key={clientId}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-gray-50 dark:bg-gray-900/20 border-r-4 border-r-gray-500' : ''
                  }`}
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {client.avatarUrl ? (
                        <img 
                          src={client.avatarUrl} 
                          alt={client.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center shadow-sm ${client.avatarUrl ? 'hidden' : ''}`}
                        style={{ display: client.avatarUrl ? 'none' : 'flex' }}
                      >
                        <span className="text-white font-bold text-lg">
                          {client.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">{client.name}</h5>
                        <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                        {client.phone && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">{client.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-gray-500 fill-gray-500" />
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                          {client.loyaltyPoints || 0}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">نقاط الولاء</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* تفاصيل العميل المحدد */}
      {selectedClient && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-gray-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-gray-600 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تفاصيل نقاط {selectedClient.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إدارة نقاط الولاء للعميل</p>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-gray-500 fill-gray-500" />
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {selectedClient.loyaltyPoints || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">نقطة</div>
              </div>
            </div>
          </div>

          {/* إضافة نقاط سريعة */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h5 className="text-md font-semibold text-gray-900 dark:text-white">إضافة نقاط سريعة</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleAddPoints((selectedClient as any)._id || (selectedClient as any).id, 10, 'مكافأة حضور')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200 border border-green-200 dark:border-green-700"
              >
                <TrendingUp className="w-4 h-4" />
                +10 (حضور)
              </button>
              <button
                onClick={() => handleAddPoints((selectedClient as any)._id || (selectedClient as any).id, 25, 'مكافأة أداء')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-900/30 dark:hover:to-gray-800/30 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <Award className="w-4 h-4" />
                +25 (أداء)
              </button>
              <button
                onClick={() => handleAddPoints((selectedClient as any)._id || (selectedClient as any).id, 50, 'مكافأة خاصة')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-900/30 dark:hover:to-gray-800/30 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <Gift className="w-4 h-4" />
                +50 (خاصة)
              </button>
            </div>
          </div>

          {/* سجل النقاط */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h5 className="text-md font-semibold text-gray-900 dark:text-white">سجل النقاط</h5>
            </div>
            
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
              </div>
            ) : historyError ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-500 text-xl">!</span>
                </div>
                <p className="text-red-500 dark:text-red-400">{historyError}</p>
              </div>
            ) : clientPointsHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">لا يوجد سجل نقاط</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientPointsHistory.map((record, index) => (
                  <div key={record._id || index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          record.points > 0 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          <span className={`text-sm font-bold ${
                            record.points > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {record.points > 0 ? '+' : ''}{record.points}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                            record.type === 'earned' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : record.type === 'redeemed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {record.type === 'earned' ? 'مكتسبة' : 
                             record.type === 'redeemed' ? 'مستبدلة' : 
                             record.type === 'admin_added' ? 'مضافة' :
                             record.type === 'admin_deducted' ? 'مخصومة' : record.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {record.createdAt ? new Date(record.createdAt).toLocaleDateString('ar-EG') : '-'}
                        </div>
                      </div>
                    </div>
                    {record.reason && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{record.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerLoyaltyPoints;
