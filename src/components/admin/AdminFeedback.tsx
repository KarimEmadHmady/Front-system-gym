'use client';

import React, { useEffect, useState } from 'react';
import { getAllFeedback, deleteFeedback, createFeedback, updateFeedback } from '@/services/feedbackService';
import { userService } from '@/services';
import type { Feedback, User } from '@/types/models';
import { Star, X, AlertTriangle, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import VideoTutorial from '../VideoTutorial';

const initialForm = {
  fromUserId: '',
  toUserId: '',
  rating: 0,
  comment: '',
};

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; feedback: Feedback | null }>({ show: false, feedback: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [feedbackList, membersRes, trainersRes, adminsRes, managersRes] = await Promise.all([
          getAllFeedback(),
          userService.getUsersByRole('member', { limit: 1000 }),
          userService.getUsersByRole('trainer', { limit: 1000 }),
          userService.getUsersByRole('admin', { limit: 1000 }),
          userService.getUsersByRole('manager', { limit: 1000 }),
        ]);
        const extract = (res: any) => {
          const tdata = res.data || res;
          return tdata?.items || tdata || [];
        };
        const allUsers: User[] = [
          ...extract(membersRes),
          ...extract(trainersRes),
          ...extract(adminsRes),
          ...extract(managersRes),
        ];
        setFeedbacks(feedbackList);
        setUsers(allUsers);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserName = (id?: string) => {
    if (!id) return 'مجهول';
    const user = users.find(u => u._id === id);
    return user ? user.name : 'غير معروف';
  };

  const openDeleteModal = (feedback: Feedback) => {
    setDeleteModal({ show: true, feedback });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, feedback: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.feedback) return;
    
    try {
      await deleteFeedback(deleteModal.feedback._id);
      setFeedbacks(prev => prev.filter(f => f._id !== deleteModal.feedback!._id));
      closeDeleteModal();
    } catch (err: any) {
      alert('فشل الحذف: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (fb: Feedback) => {
    setForm({
      fromUserId: fb.fromUserId ? String(fb.fromUserId) : '',
      toUserId: fb.toUserId ? String(fb.toUserId) : '',
      rating: fb.rating,
      comment: fb.comment || '',
    });
    setEditId(fb._id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStarClick = (i: number) => {
    setForm({ ...form, rating: i });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromUserId || !form.toUserId || !form.rating) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateFeedback(editId, form);
        setFeedbacks(prev => prev.map(f => f._id === editId ? { ...f, ...updated } : f));
      } else {
        const created = await createFeedback(form);
        setFeedbacks(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setSaving(false);
    }
  };

  // Only non-trainers can be senders
  const senderOptions = users.filter(u => u.role !== 'trainer');
  // Only trainers can be recipients
  const recipientOptions = users.filter(u => u.role === 'trainer');

  // Filter feedbacks by search (on recipient/مدرب) and selected trainer
  const filteredFeedbacks = feedbacks.filter(fb => {
    // فلترة بالمدرب المختار
    if (selectedTrainer && fb.toUserId !== selectedTrainer) return false;
    if (!search.trim()) return true;
    const trainer = recipientOptions.find(u => u._id === fb.toUserId);
    if (!trainer) return false;
    const q = search.trim().toLowerCase();
    return (
      (trainer.name && trainer.name.toLowerCase().includes(q)) ||
      (trainer.phone && trainer.phone.includes(q))
    );
  });

  // Reset to first page when search or trainer filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTrainer]);

  const pageCount = Math.max(1, Math.ceil(filteredFeedbacks.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredFeedbacks.length);
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  // تصدير البيانات إلى Excel
  const handleExportToExcel = () => {
    const exportData = filteredFeedbacks.map((feedback) => {
      const sender = users.find(u => u._id === feedback.fromUserId);
      const recipient = users.find(u => u._id === feedback.toUserId);
      const dateObj = new Date(feedback.date);
      
      return {
        'اسم المرسل': sender?.name || 'غير معروف',
        'هاتف المرسل': sender?.phone || '-',
        'إيميل المرسل': sender?.email || '-',
        'دور المرسل': sender?.role || '-',
        'اسم المستلم': recipient?.name || 'غير معروف',
        'هاتف المستلم': recipient?.phone || '-',
        'إيميل المستلم': recipient?.email || '-',
        'دور المستلم': recipient?.role || '-',
        'التقييم': feedback.rating,
        'التقييم (نجوم)': '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating),
        'التعليق': feedback.comment || '-',
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الساعة': dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'التقييمات');
    
    // تصدير الملف
    const fileName = `التقييمات_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
       <VideoTutorial 
        videoId="Hlidkb9Iobs"
        title="عرض تقييمات كل مدرب داخل النظام" 
         position="bottom-right"
        buttonText="شرح"
       />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التقييمات والملاحظات</h3>
        <div className="flex items-center gap-2 ">
          <button
            onClick={handleExportToExcel}
            disabled={filteredFeedbacks.length === 0}
            className="flex items-center gap-1 px-2 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md text-sm"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>
          <button onClick={openAddModal} className="px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">إضافة تقييم</button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 md:gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم المدرب أو رقم الهاتف..."
            className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedTrainer}
            onChange={e => setSelectedTrainer(e.target.value)}
            className="w-full px-2 py-1 border rounded-md text-black bg-white dark:bg-gray-900 dark:text-white"
          >
            <option value="">كل المدربين</option>
            {recipientOptions.map(u => (
              <option key={u._id} value={u._id} className="text-black dark:text-white">{u.name} ({u.phone || 'بدون هاتف'})</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">لا توجد نتائج مطابقة.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-3 text-center">المرسل</th>
                <th className="py-2 px-3 text-center">المستلم</th>
                <th className="py-2 px-3 text-center">التقييم</th>
                <th className="py-2 px-3 text-center">التعليق</th>
                <th className="py-2 px-3 text-center ">التاريخ</th>
                <th className="py-2 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFeedbacks.map(fb => (
                <tr key={fb._id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-3 text-center">{getUserName(fb.fromUserId)}</td>
                  <td className="py-2 px-3 text-center">{getUserName(fb.toUserId)}</td>
                  <td className="py-2 px-3 text-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={18} className={
                        'inline-block mx-0.5 ' + (i <= fb.rating ? 'text-gray-400 fill-gray-400' : 'text-gray-300')
                      } fill={i <= fb.rating ? '#facc15' : 'none'} />
                    ))}
                  </td>
                  <td className="py-2 px-3 text-center">{fb.comment || '-'}</td>
                  <td className="py-2 px-3 text-center">{new Date(fb.date).toLocaleDateString()}</td>
                  <td className="py-2 px-3 flex gap-2 text-center">
                      <div className="flex gap-2 justify-center w-[100%]">
                      <button onClick={() => openEditModal(fb)} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs">تعديل</button>
                      <button onClick={() => openDeleteModal(fb)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">حذف</button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredFeedbacks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            عرض {startIndex + 1} إلى {endIndex} من {filteredFeedbacks.length} نتيجة
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </button>
            <span>
              صفحة {currentPage} من {pageCount}
            </span>
            <button
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute right-3 top-3 text-gray-400 hover:text-red-500"><X size={22} /></button>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{editId ? 'تعديل تقييم' : 'إضافة تقييم'}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">المرسل</label>
                <select name="fromUserId" value={form.fromUserId} onChange={handleFormChange} className="w-full rounded border px-2 py-1 dark:text-white dark:bg-gray-900">
                  <option value="" className="text-black dark:text-white">اختر المرسل</option>
                  {senderOptions.map(u => (
                    <option key={u._id} value={String(u._id)} className="text-black dark:text-white">{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">المستلم</label>
                <select name="toUserId" value={form.toUserId} onChange={handleFormChange} className="w-full rounded border px-2 py-1 dark:text-white dark:bg-gray-900">
                  <option value="" className="text-black dark:text-white">اختر المدرب المستلم</option>
                  {recipientOptions.map(u => (
                    <option key={u._id} value={String(u._id)} className="text-black dark:text-white">{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm">التقييم</label>
                <div className="flex flex-row-reverse gap-1 justify-end">
                  {[1,2,3,4,5].map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleStarClick(i)}
                      onMouseEnter={() => setHoveredRating(i)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        size={24}
                        className={
                          (i <= (hoveredRating || form.rating)
                            ? 'text-gray-400 fill-gray-400'
                            : 'text-gray-300')
                        }
                        fill={i <= (hoveredRating || form.rating) ? '#facc15' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm">التعليق</label>
                <textarea name="comment" value={form.comment} onChange={handleFormChange} className="w-full rounded border px-2 py-1 min-h-[60px]" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md mt-2">
                {saving ? 'جارٍ الحفظ...' : editId ? 'تحديث' : 'إضافة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                تأكيد الحذف
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                هل أنت متأكد من حذف هذا التقييم؟
              </p>
              
              {/* Feedback Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">المرسل:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getUserName(deleteModal.feedback.fromUserId)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">المستلم:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getUserName(deleteModal.feedback.toUserId)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">التقييم:</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={
                          'inline-block mx-0.5 ' + 
                          (i <= (deleteModal.feedback?.rating || 0) ? 'text-gray-400 fill-gray-400' : 'text-gray-300')
                        } 
                        fill={i <= (deleteModal.feedback?.rating || 0) ? '#facc15' : 'none'} 
                      />
                    ))}
                  </div>
                </div>
                {deleteModal.feedback.comment && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">التعليق:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded border">
                      {deleteModal.feedback.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeDeleteModal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 size={16} />
                حذف التقييم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;


