'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PurchaseService, type PurchaseDTO } from '@/services/purchaseService';

const MemberPurchases = () => {
  const { user, isAuthenticated } = useAuth();
  const userId = useMemo(() => ((user as any)?._id ?? user?.id ?? ''), [user]);
  const svc = useMemo(() => new PurchaseService(), []);

  const [items, setItems] = useState<PurchaseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await svc.getByUser(userId);
      const arr = Array.isArray(res) ? res : (res as any)?.data || [];
      setItems(arr as PurchaseDTO[]);
    } catch (e: any) {
      setError(e?.message || 'تعذر جلب المشتريات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated && userId) load(); /* eslint-disable-next-line */ }, [isAuthenticated, userId]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
    return items.filter(p => !q || (p.itemName || '').toLowerCase().includes(q) || String(p.price).includes(q));
  }, [items, search]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const total = useMemo(() => filtered.reduce((sum, p) => sum + (Number(p.price) || 0), 0), [filtered]);

  // Update pagination when filtered data changes
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filtered.length, itemsPerPage, currentPage]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">مشترياتي</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">عرض مشتريات الخاصة بى </p>
          </div>
          <div className="flex items-center gap-2">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالعنصر/السعر" className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white rounded-lg p-4 flex items-center justify-between">
            <div className="text-sm opacity-90">إجمالي المشتريات المعروضة</div>
            <div className="text-2xl font-bold">{total.toFixed(2)}</div>
          </div>
          {loading ? (
            <div className="col-span-1 md:col-span-3 text-gray-500 dark:text-gray-400">جارٍ التحميل...</div>
          ) : error ? (
            <div className="col-span-1 md:col-span-3 text-red-600">{error}</div>
          ) : paginatedItems.length === 0 ? (
            <div className="col-span-1 md:col-span-3 text-gray-400 text-center py-8">لا توجد مشتريات</div>
          ) : (
            paginatedItems.map(p => {
              const d = p.date ? new Date(p.date) : (p.createdAt ? new Date(p.createdAt) : null);
              return (
                <div key={p._id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-gray-900 dark:text-white font-semibold">{p.itemName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{d ? d.toLocaleDateString() : '-'}{d ? ` • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</div>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">{Number(p.price).toFixed(2)} ج.م</span>
                  </div>
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
          {filtered.length > 0 && (
            <div className="col-span-1 md:col-span-3 mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length} مشتري
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberPurchases;


