'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PaymentService, type Payment } from '@/services/paymentService';
import MemberInvoices from './MemberInvoices';

const methodLabel = (m: Payment['method']) => m === 'cash' ? 'نقدي' : m === 'card' ? 'بطاقة' : m === 'bank_transfer' ? 'تحويل بنكي' : 'أخرى';
const methodColor = (m: Payment['method']) => (
  m === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
  m === 'card' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
  m === 'bank_transfer' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
);

const MemberPayments = () => {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = useMemo(() => ((user as any)?._id ?? user?.id ?? ''), [user]);
  const svc = useMemo(() => new PaymentService(), []);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  const [search, setSearch] = useState('');
  const [method, setMethod] = useState<'all' | Payment['method']>('all');
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');

  const load = async (page: number = currentPage) => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await svc.getPaymentsByUser(currentUserId, { page, limit: itemsPerPage });
      const arr = Array.isArray(res) ? res as any : (res as any)?.data || [];
      setPayments(arr);
      
      // Update pagination info
      if (res && typeof res === 'object' && 'total' in res) {
        const total = res.total as number;
        setTotalRecords(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        // Fallback if API doesn't return total count
        setTotalRecords(arr.length);
        setTotalPages(Math.ceil(arr.length / itemsPerPage));
      }
    } catch (e: any) {
      setError(e?.message || 'تعذر جلب المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated && currentUserId) load(); /* eslint-disable-next-line */ }, [isAuthenticated, currentUserId]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      load(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter(p => {
      const inSearch = !q || String(p.amount).includes(q) || (p.notes || '').toLowerCase().includes(q) || methodLabel(p.method).toLowerCase().includes(q);
      const byMethod = method === 'all' || p.method === method;
      return inSearch && byMethod;
    });
  }, [payments, search, method]);

  const totalAmount = useMemo(() => filtered.reduce((sum, p) => sum + (Number(p.amount) || 0), 0), [filtered]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-gray-600 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('payments')}
          >
            مدفوعاتي
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'invoices' ? 'border-gray-600 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('invoices')}
          >
            فواتيري
          </button>
        </div>
        {activeTab === 'payments' && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">مدفوعاتي</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">عرض تاريخ مدفوعاتك فقط</p>
              </div>
              <div className="flex items-center gap-2">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالمبلغ/الطريقة/الملاحظات" className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm" />
                <select value={method} onChange={e=>setMethod(e.target.value as any)} className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm">
                  <option value="all">كل الطرق</option>
                  <option value="cash">نقدي</option>
                  <option value="card">بطاقة</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white rounded-lg p-4 flex items-center justify-between">
                <div className="text-sm opacity-90">إجمالي المدفوعات المعروضة</div>
                <div className="text-2xl font-bold">{totalAmount.toFixed(2)}</div>
              </div>
              {loading ? (
                <div className="col-span-1 md:col-span-3 text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
              ) : error ? (
                <div className="col-span-1 md:col-span-3 text-red-600">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="col-span-1 md:col-span-3 text-gray-400 text-center py-8">لا توجد مدفوعات</div>
              ) : (
                filtered.map(p => {
                  const d = new Date(p.date);
                  return (
                    <div key={p._id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-gray-900 dark:text-white font-semibold">{p.amount} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">ج.م</span></div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{d.toLocaleDateString()} • {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${methodColor(p.method)}`}>{methodLabel(p.method)}</span>
                      </div>
                      {p.notes ? (
                        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">{p.notes}</div>
                      ) : null}
                    </div>
                  );
                })
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="col-span-1 md:col-span-3 mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            currentPage === pageNum
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              )}
              
              {/* Pagination Info */}
              {totalRecords > 0 && (
                <div className="col-span-1 md:col-span-3 mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} من {totalRecords} مدفوع
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'invoices' && <MemberInvoices />}
      </div>
    </div>
  );
};

export default MemberPayments;


