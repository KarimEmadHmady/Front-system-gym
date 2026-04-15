'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/models';
import { UserService } from '@/services/userService';
import { ProgressService } from '@/services/progressService';
import { ChevronLeft, ChevronRight, Users, TrendingUp, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const TrainerProgressOverview = () => {
  const { user } = useAuth();
  const currentTrainerId = (user as any)?._id ?? user?.id ?? '';
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [progressModalClient, setProgressModalClient] = useState<User | null>(null);
  const [progressModalLoading, setProgressModalLoading] = useState(false);
  const [progressModalList, setProgressModalList] = useState<any[]>([]);
  const [progressEditId, setProgressEditId] = useState<string | null>(null);
  const [progressEditData, setProgressEditData] = useState<any>(null);
  const [progressDeleteId, setProgressDeleteId] = useState<string | null>(null);
  const [progressAddOpen, setProgressAddOpen] = useState(false);
  const [progressAddData, setProgressAddData] = useState<any>({ date: '', weight: '', bodyFatPercentage: '', notes: '' });
  
  // States للصور
  const [progressAddImage, setProgressAddImage] = useState<File | null>(null);
  const [progressAddImagePreview, setProgressAddImagePreview] = useState<string | null>(null);
  const [progressEditImage, setProgressEditImage] = useState<File | null>(null);
  const [progressEditImagePreview, setProgressEditImagePreview] = useState<string | null>(null);
  
  const userService = new UserService();
  const progressService = new ProgressService();

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
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

  // دالة لمعالجة رفع الصور
  const handleImageChange = (file: File | null, setImage: (file: File | null) => void, setPreview: (preview: string | null) => void) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // حساب البيانات للصفحات
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = clients.slice(startIndex, endIndex);

  // تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper to export clients table to Excel
  const handleExport = () => {
    const data = clients.map(client => ({
      'الاسم': client.name,
      'البريد الإلكتروني': client.email,
      'رقم الهاتف': client.phone || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'clients_progress_overview.xlsx');
  };

  // Helper to export progressModalList to Excel (for selected client)
  const handleExportProgress = () => {
    if (!progressModalClient || !progressModalList) return;
    const data = progressModalList.map((p) => ({
      'التاريخ': p.date ? new Date(p.date).toLocaleDateString() : '-',
      'الوزن': p.weight ?? '-',
      'نسبة الدهون': p.bodyFatPercentage ?? '-',
      'الكتلة العضلية': p.muscleMass ?? '-',
      'مقاس الوسط': p.waist ?? '-',
      'مقاس الصدر': p.chest ?? '-',
      'مقاس الذراع': p.arms ?? '-',
      'مقاس الرجل': p.legs ?? '-',
      'تغير الوزن': p.weightChange ?? '-',
      'تغير الدهون': p.fatChange ?? '-',
      'تغير الكتلة العضلية': p.muscleChange ?? '-',
      'الحالة العامة': p.status ?? '-',
      'نصيحة المدرب': p.advice ?? '-',
      'ملاحظات': p.notes || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Progress');
    XLSX.writeFile(wb, `progress_${progressModalClient.name || 'client'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="flex justify-center my-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center w-full max-w-xs">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white shadow mb-2">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-1">{clients.length}</p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">إجمالي العملاء</p>
        </div>
      </div>

      {/* Client Progress Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تقدم العملاء
              </h3>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              تصدير البيانات
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          ) : currentClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">لا يوجد عملاء</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentClients.map((client) => (
                <div key={client._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
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
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{client.name}</h4>
                        <p className="text-[7px] sm:text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                        {client.phone && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">{client.phone}</p>
                        )}
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-1 px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-[10px] font-medium transition-colors"
                      onClick={async () => {
                        setProgressModalClient(client);
                        setProgressModalLoading(true);
                        setProgressModalList([]);
                        try {
                          const list = await progressService.getUserProgress(client._id);
                          setProgressModalList(list);
                        } catch {
                          setProgressModalList([]);
                        } finally {
                          setProgressModalLoading(false);
                        }
                      }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      سجلات التقدم
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                عرض {startIndex + 1} إلى {Math.min(endIndex, clients.length)} من {clients.length} عميل
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {progressModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProgressModalClient(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">سجلات التقدم - {progressModalClient.name}</div>
              <button onClick={() => setProgressModalClient(null)} className="px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-800 dark:text-white">إغلاق</button>
            </div>
            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={handleExportProgress}
                className="px-3 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700 text-white"
              >
                تصدير السجلات
              </button>
              <button onClick={() => { setProgressAddOpen(true); setProgressAddData({ date: '', weight: '', bodyFatPercentage: '', notes: '' }); }} className="px-3 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white">إضافة سجل جديد</button>
            </div>
            {progressModalLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : progressModalList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">لا يوجد سجلات تقدم</div>
            ) : (
              <div className="space-y-4">
                  {progressModalList.map((p) => (
                  <div key={p._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {p.date ? new Date(p.date).getDate() : '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {p.date ? new Date(p.date).toLocaleDateString('ar-EG') : 'بدون تاريخ'}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.status || 'لا توجد حالة محددة'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            setProgressEditId(p._id); 
                            setProgressEditData({ 
                              ...p, 
                              date: p.date ? new Date(p.date).toISOString().slice(0,10) : '' 
                            }); 
                          }} 
                          className="px-3 py-1 rounded bg-gray-600 text-white text-xs hover:bg-gray-700"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => setProgressDeleteId(p._id)} 
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    {/* Measurements Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الوزن</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.weight ? `${p.weight} كجم` : '-'}
                        </div>
                        {p.weightChange && (
                          <div className={`text-xs ${Number(p.weightChange) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {Number(p.weightChange) > 0 ? '+' : ''}{p.weightChange} كجم
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">نسبة الدهون</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.bodyFatPercentage ? `${p.bodyFatPercentage}%` : '-'}
                        </div>
                        {p.fatChange && (
                          <div className={`text-xs ${Number(p.fatChange) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {Number(p.fatChange) > 0 ? '+' : ''}{p.fatChange}%
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الكتلة العضلية</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.muscleMass ? `${p.muscleMass} كجم` : '-'}
                        </div>
                        {p.muscleChange && (
                          <div className={`text-xs ${Number(p.muscleChange) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Number(p.muscleChange) > 0 ? '+' : ''}{p.muscleChange} كجم
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">مقاس الوسط</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.waist ? `${p.waist} سم` : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Body Measurements */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الصدر</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.chest ? `${p.chest} سم` : '-'}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الذراع</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.arms ? `${p.arms} سم` : '-'}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">الرجل</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.legs ? `${p.legs} سم` : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Notes and Advice */}
                    {(p.notes || p.advice) && (
                      <div className="space-y-2">
                        {p.advice && (
                          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">نصيحة المدرب</div>
                            <div className="text-sm text-gray-900 dark:text-white">{p.advice}</div>
                          </div>
                        )}
                        
                        {p.notes && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">ملاحظات</div>
                            <div className="text-sm text-gray-900 dark:text-white">{p.notes}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image */}
                        {p.image?.url && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">صورة التقدم</div>
                        <img 
                          src={p.image.url} 
                          alt="صورة التقدم" 
                          className="w-full max-w-xs rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                          </div>
                        )}
                  </div>
                ))}
              </div>
            )}
            {/* بوب أب إضافة سجل */}
            {progressAddOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setProgressAddOpen(false)} />
                <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
                  <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">إضافة سجل جديد</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
                      <input type="date" value={progressAddData.date} onClick={(e) => e.currentTarget.showPicker?.()} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, date: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
                      <input type="number" value={progressAddData.weight} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, weight: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
                      <input type="number" value={progressAddData.bodyFatPercentage} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, bodyFatPercentage: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الكتلة العضلية (كجم)</label>
                        <input type="number" value={progressAddData.muscleMass || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, muscleMass: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الوسط (سم)</label>
                        <input type="number" value={progressAddData.waist || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, waist: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الصدر (سم)</label>
                        <input type="number" value={progressAddData.chest || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, chest: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الذراع (سم)</label>
                        <input type="number" value={progressAddData.arms || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, arms: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الرجل (سم)</label>
                        <input type="number" value={progressAddData.legs || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, legs: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الوزن عن السابق (كجم)</label>
                        <input type="number" value={progressAddData.weightChange || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, weightChange: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الدهون عن السابق (%)</label>
                        <input type="number" value={progressAddData.fatChange || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, fatChange: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الكتلة العضلية عن السابق (كجم)</label>
                        <input type="number" value={progressAddData.muscleChange || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, muscleChange: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة العامة</label>
                        <select value={progressAddData.status || 'جيد'} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white">
                          <option value="ممتاز">ممتاز</option>
                          <option value="جيد">جيد</option>
                          <option value="يحتاج لتحسين">يحتاج لتحسين</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نصيحة المدرب</label>
                      <input type="text" value={progressAddData.advice || ''} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, advice: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                      <input type="text" value={progressAddData.notes} onChange={e => setProgressAddData((d: typeof progressAddData) => ({ ...d, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    
                    {/* حقل رفع الصورة */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">صورة التقدم (اختيارية)</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleImageChange(file, setProgressAddImage, setProgressAddImagePreview);
                          }}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                        />
                        {progressAddImagePreview && (
                          <div className="mt-2">
                            <img
                              src={progressAddImagePreview}
                              alt="معاينة الصورة"
                              className="w-32 h-32 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProgressAddImage(null);
                                setProgressAddImagePreview(null);
                              }}
                              className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              إزالة الصورة
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button onClick={() => { setProgressAddOpen(false); setProgressAddImage(null); setProgressAddImagePreview(null); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
                    <button
                      onClick={async () => {
                        if (!progressAddData.date) return;
                        setProgressModalLoading(true);
                        try {
                          const payload = {
                            userId: progressModalClient._id,
                            trainerId: currentTrainerId,
                            date: new Date(progressAddData.date),
                            weight: progressAddData.weight ? Number(progressAddData.weight) : undefined,
                            bodyFatPercentage: progressAddData.bodyFatPercentage ? Number(progressAddData.bodyFatPercentage) : undefined,
                            muscleMass: progressAddData.muscleMass ? Number(progressAddData.muscleMass) : undefined,
                            waist: progressAddData.waist ? Number(progressAddData.waist) : undefined,
                            chest: progressAddData.chest ? Number(progressAddData.chest) : undefined,
                            arms: progressAddData.arms ? Number(progressAddData.arms) : undefined,
                            legs: progressAddData.legs ? Number(progressAddData.legs) : undefined,
                            weightChange: progressAddData.weightChange ? Number(progressAddData.weightChange) : undefined,
                            fatChange: progressAddData.fatChange ? Number(progressAddData.fatChange) : undefined,
                            muscleChange: progressAddData.muscleChange ? Number(progressAddData.muscleChange) : undefined,
                            status: progressAddData.status || 'جيد',
                            advice: progressAddData.advice || '',
                            notes: progressAddData.notes || '',
                          };
                          await progressService.create(payload, progressAddImage);
                          // إعادة تحميل السجلات
                          const list = await progressService.getUserProgress(progressModalClient._id);
                          setProgressModalList(list);
                          setProgressAddOpen(false);
                          // إعادة تعيين الصورة
                          setProgressAddImage(null);
                          setProgressAddImagePreview(null);
                        } finally {
                          setProgressModalLoading(false);
                        }
                      }}
                      className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
                      disabled={!progressAddData.date || progressModalLoading}
                    >حفظ</button>
                  </div>
                </div>
              </div>
            )}
            {/* بوب أب تعديل سجل */}
            {progressEditId && progressEditData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setProgressEditId(null)} />
                <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[80vh]">
                  <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تعديل سجل التقدم</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">التاريخ</label>
                      <input type="date" value={progressEditData.date} onClick={(e) => e.currentTarget.showPicker?.()} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, date: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الوزن (كجم)</label>
                      <input type="number" value={progressEditData.weight} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, weight: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نسبة الدهون %</label>
                      <input type="number" value={progressEditData.bodyFatPercentage} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, bodyFatPercentage: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الكتلة العضلية (كجم)</label>
                        <input type="number" value={progressEditData.muscleMass || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, muscleMass: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الوسط (سم)</label>
                        <input type="number" value={progressEditData.waist || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, waist: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الصدر (سم)</label>
                        <input type="number" value={progressEditData.chest || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, chest: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الذراع (سم)</label>
                        <input type="number" value={progressEditData.arms || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, arms: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">مقاس الرجل (سم)</label>
                        <input type="number" value={progressEditData.legs || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, legs: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الوزن عن السابق (كجم)</label>
                        <input type="number" value={progressEditData.weightChange || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, weightChange: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الدهون عن السابق (%)</label>
                        <input type="number" value={progressEditData.fatChange || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, fatChange: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">تغير الكتلة العضلية عن السابق (كجم)</label>
                        <input type="number" value={progressEditData.muscleChange || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, muscleChange: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">الحالة العامة</label>
                        <select value={progressEditData.status || 'جيد'} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white">
                          <option value="ممتاز">ممتاز</option>
                          <option value="جيد">جيد</option>
                          <option value="يحتاج لتحسين">يحتاج لتحسين</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">نصيحة المدرب</label>
                      <input type="text" value={progressEditData.advice || ''} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, advice: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">ملاحظات</label>
                      <input type="text" value={progressEditData.notes} onChange={e => setProgressEditData((d: typeof progressEditData) => ({ ...d, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white" />
                    </div>
                    
                    {/* حقل رفع الصورة في التعديل */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">صورة التقدم (اختيارية)</label>
                      <div className="space-y-2">
                        {/* عرض الصورة الحالية إذا كانت موجودة */}
                        {(() => {
                          const progress = progressModalList.find(p => p._id === progressEditId);
                          const currentImageUrl = progress?.image?.url;
                          return currentImageUrl && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">الصورة الحالية:</p>
                              <img
                                src={currentImageUrl}
                                alt="الصورة الحالية"
                                className="w-32 h-32 object-cover rounded-md border"
                              />
                            </div>
                          );
                        })()}
                        
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleImageChange(file, setProgressEditImage, setProgressEditImagePreview);
                          }}
                          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                        />
                        {progressEditImagePreview && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">الصورة الجديدة:</p>
                            <img
                              src={progressEditImagePreview}
                              alt="معاينة الصورة الجديدة"
                              className="w-32 h-32 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProgressEditImage(null);
                                setProgressEditImagePreview(null);
                              }}
                              className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              إزالة الصورة الجديدة
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button onClick={() => { setProgressEditId(null); setProgressEditImage(null); setProgressEditImagePreview(null); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
                    <button
                      onClick={async () => {
                        setProgressModalLoading(true);
                        try {
                          const progress = progressModalList.find(p => p._id === progressEditId);
                          const oldImagePublicId = progress?.image?.publicId;
                          
                          await progressService.update(progressEditId, {
                            date: progressEditData.date ? new Date(progressEditData.date) : undefined,
                            weight: progressEditData.weight ? Number(progressEditData.weight) : undefined,
                            bodyFatPercentage: progressEditData.bodyFatPercentage ? Number(progressEditData.bodyFatPercentage) : undefined,
                            muscleMass: progressEditData.muscleMass ? Number(progressEditData.muscleMass) : undefined,
                            waist: progressEditData.waist ? Number(progressEditData.waist) : undefined,
                            chest: progressEditData.chest ? Number(progressEditData.chest) : undefined,
                            arms: progressEditData.arms ? Number(progressEditData.arms) : undefined,
                            legs: progressEditData.legs ? Number(progressEditData.legs) : undefined,
                            weightChange: progressEditData.weightChange ? Number(progressEditData.weightChange) : undefined,
                            fatChange: progressEditData.fatChange ? Number(progressEditData.fatChange) : undefined,
                            muscleChange: progressEditData.muscleChange ? Number(progressEditData.muscleChange) : undefined,
                            status: progressEditData.status || 'جيد',
                            advice: progressEditData.advice || '',
                            notes: progressEditData.notes || '',
                          }, progressEditImage || undefined, oldImagePublicId);
                          
                          // إعادة تحميل السجلات
                          const list = await progressService.getUserProgress(progressModalClient._id);
                          setProgressModalList(list);
                          setProgressEditId(null);
                          // إعادة تعيين الصورة
                          setProgressEditImage(null);
                          setProgressEditImagePreview(null);
                        } finally {
                          setProgressModalLoading(false);
                        }
                      }}
                      className="px-4 py-2 rounded bg-gray-600 text-white disabled:opacity-60"
                      disabled={progressModalLoading}
                    >تأكيد</button>
                  </div>
                </div>
              </div>
            )}
            {/* بوب أب حذف سجل */}
            {progressDeleteId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setProgressDeleteId(null)} />
                <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
                  <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">تأكيد حذف السجل</div>
                  <div className="mb-6 text-gray-700 dark:text-gray-300">هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع.</div>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => setProgressDeleteId(null)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800">إلغاء</button>
                    <button onClick={async () => {
                      setProgressModalLoading(true);
                      try {
                        await progressService.delete(progressDeleteId);
                        // إعادة تحميل السجلات
                        const list = await progressService.getUserProgress(progressModalClient._id);
                        setProgressModalList(list);
                        setProgressDeleteId(null);
                      } finally {
                        setProgressModalLoading(false);
                      }
                    }} className="px-4 py-2 rounded bg-red-600 text-white">تأكيد الحذف</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProgressOverview;
