'use client';

import React, { useEffect, useState } from 'react';
import { getAllFeedback, deleteFeedback, createFeedback, updateFeedback } from '@/services/feedbackService';
import { userService } from '@/services';
import type { Feedback, User } from '@/types/models';
import { Star, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';
import VideoTutorial from '../VideoTutorial';

const initialForm = {
  fromUserId: '',
  toUserId: '',
  rating: 0,
  comment: '',
};

const ManagerFeedback = () => {
  const { user } = useAuth();
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    try {
      await deleteFeedback(id);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (err: any) {
      alert('فشل الحذف: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  const openAddModal = () => {
    if (!user || !user.id) {
      alert('حدث خطأ في تحميل بيانات المستخدم. أعد تحميل الصفحة.');
      return;
    }
    setForm({ ...initialForm, fromUserId: user.id });
    setEditId(null);
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
    if (!form.toUserId || !form.rating) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        toUserId: form.toUserId,
        rating: form.rating,
        comment: form.comment,
      };
      if (form.fromUserId) payload.fromUserId = form.fromUserId;
      const created = await createFeedback(payload);
      setFeedbacks(prev => [created, ...prev]);
      setShowModal(false);
    } catch (err: any) {
      alert('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setSaving(false);
    }
  };

  // دالة تصدير البيانات إلى Excel
  const handleExportData = () => {
    try {
      if (!filteredFeedbacks || filteredFeedbacks.length === 0) {
        return;
      }

      // تحضير البيانات للتصدير
      const exportData = filteredFeedbacks.map((feedback, index) => {
        const sender = users.find(u => u._id === feedback.fromUserId);
        const recipient = users.find(u => u._id === feedback.toUserId);
        
        return {
          'الرقم التسلسلي': index + 1,
          'اسم المرسل': sender?.name || 'غير معروف',
          'بريد المرسل': sender?.email || '',
          'هاتف المرسل': sender?.phone || '',
          'دور المرسل': sender?.role || '',
          'اسم المستلم (المدرب)': recipient?.name || 'غير معروف',
          'بريد المستلم': recipient?.email || '',
          'هاتف المستلم': recipient?.phone || '',
          'التقييم (نجوم)': feedback.rating || 0,
          'التقييم (نص)': feedback.rating === 5 ? 'ممتاز' :
                          feedback.rating === 4 ? 'جيد جداً' :
                          feedback.rating === 3 ? 'جيد' :
                          feedback.rating === 2 ? 'مقبول' : 'ضعيف',
          'التعليق': feedback.comment || '',
          'تاريخ التقييم': feedback.date ? new Date(feedback.date).toLocaleDateString('ar-EG') : '',
          'تاريخ الإنشاء': feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString('ar-EG') : '',
          'آخر تحديث': feedback.updatedAt ? new Date(feedback.updatedAt).toLocaleDateString('ar-EG') : '',
        };
      });

      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // إنشاء كتاب عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'التقييمات');

      // تصدير الملف
      const fileName = `تقييمات_المدربين_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
       <VideoTutorial 
        videoId="Hlidkb9Iobs"
        title="عرض تقييمات كل مدرب داخل النظام" 
         position="bottom-right"
        buttonText="شرح"
       />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التقييمات والملاحظات</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || filteredFeedbacks.length === 0}
          >
            تصدير Excel
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!user || !user.id}
          >
            إضافة تقييم
          </button>
          {(!user || !user.id) && (
            <span className="text-xs text-gray-500">جاري تحميل بيانات المستخدم...</span>
          )}
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
            className="w-full px-2 py-2 border rounded-md text-black bg-white dark:bg-gray-900 dark:text-white"
          >
            <option value="">كل المدربين</option>
            {recipientOptions.map(u => (
              <option key={u._id} value={u._id} className="text-black">{u.name} ({u.phone || 'بدون هاتف'})</option>
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
                <th className="py-2 px-3 text-center">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map(fb => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute right-3 top-3 text-gray-400 hover:text-red-500"><X size={22} /></button>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">إضافة تقييم</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* لا يوجد حقل مرسل */}
              <div>
                <label className="block mb-1 text-sm">المستلم</label>
                <select name="toUserId" value={form.toUserId} onChange={handleFormChange} className="w-full rounded border px-2 py-1">
                  <option value="" className="text-black">اختر المدرب المستلم</option>
                  {recipientOptions.map(u => (
                    <option key={u._id} value={String(u._id)} className="text-black">{u.name} ({u.role})</option>
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
                {saving ? 'جارٍ الحفظ...' : 'إضافة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerFeedback;

