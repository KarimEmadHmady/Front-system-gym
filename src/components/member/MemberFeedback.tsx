'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services';
import { getAllFeedback, createFeedback, getFeedbackForUser } from '@/services/feedbackService';
import type { Feedback, User } from '@/types/models';
import { Star, X } from 'lucide-react';

const initialForm = {
  rating: 0,
  comment: '',
};

const MemberFeedback = () => {
  const { user } = useAuth();
  const [member, setMember] = useState<User | null>(null);
  const [trainer, setTrainer] = useState<User | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const trainerId = (trainer as any)?._id || (trainer as any)?.id;

  const getTrainerName = (id?: string) => {
    if (!id) return 'غير معروف';
    // ابحث عن المدرب في قائمة المدربين
    const t = trainers.find(t => (t._id === id) || ((t as any).id === id) || (String(t._id) === String(id)));
    if (t) return t.name;
    // إذا لم يوجد، استخدم اسم المدرب الحالي
    if (trainer && ((trainer as any)._id === id || (trainer as any).id === id)) {
      return trainer.name;
    }
    // وإلا استخدم "مدرب سابق" (سيتم تحديثه عند جلب البيانات)
    return 'مدرب سابق';
  };

  // جلب بيانات العضو ومدربه
  useEffect(() => {
    const fetchMemberAndTrainer = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const me = await userService.getUser(user.id);
        setMember(me as any);
        const tId = (me as any)?.trainerId;
        if (tId) {
          const t = await userService.getUser(typeof tId === 'object' ? (tId as any)._id : tId);
          setTrainer(t as any);
        } else {
          setTrainer(null);
        }
      } catch {
        setError('تعذر جلب بيانات المدرب');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberAndTrainer();
  }, [user]);

  // جلب التقييمات التي أرسلها العضو
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        // جرب جلب كل التقييمات وفلترتها
        const allFeedbacks = await getAllFeedback();
        const myFeedbacks = allFeedbacks.filter(fb => 
          fb.fromUserId === user.id || fb.fromUserId === (user as any)._id
        );
        setFeedbacks(myFeedbacks);
        
        // جلب بيانات المدربين من التقييمات
        try {
          const trainerIds = [...new Set(myFeedbacks.map(fb => fb.toUserId))];
          const trainerPromises = trainerIds.map(id => 
            userService.getUser(id).catch(() => null)
          );
          const trainerResults = await Promise.all(trainerPromises);
          const validTrainers = trainerResults.filter(t => t !== null) as User[];
          setTrainers(validTrainers);
        } catch (trainerErr: any) {
          console.warn('Could not fetch trainers:', trainerErr);
          // لا نعرض خطأ هنا، فقط نستخدم "مدرب سابق"
        }
      } catch (err: any) {
        console.error('Error fetching feedbacks:', err);
        // إذا فشل، جرب getFeedbackForUser كبديل
        try {
          const myFeedbacks = await getFeedbackForUser(user.id);
          setFeedbacks(myFeedbacks);
        } catch (err2: any) {
          console.error('Error fetching user feedbacks:', err2);
          setError('تعذر جلب التقييمات: ' + (err2.message || 'خطأ غير معروف'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [user]);

  const openAddModal = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStarClick = (i: number) => {
    setForm({ ...form, rating: i });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id || !trainerId || !form.rating) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fromUserId: user.id,
        toUserId: trainerId,
        rating: form.rating,
        comment: form.comment,
      };
      const created = await createFeedback(payload);
      setFeedbacks(prev => [created, ...prev]);
      setShowModal(false);
    } catch (err: any) {
      alert('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تقييم مدربي</h3>
      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {trainer && (
            <button onClick={openAddModal} className="mb-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm">إرسال تقييم جديد</button>
          )}
          <div className="mt-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">لا توجد تقييمات بعد.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {feedbacks.map(fb => (
                  <div
                    key={fb._id}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex flex-col gap-2 hover:shadow-md transition cursor-pointer dark:hover:bg-gray-700"
                    dir="rtl"
                    onClick={() => { setSelectedFeedback(fb); setShowModal(true); }}
                  >
                    <div className="flex items-end gap-2 mb-1 flex-row-reverse justify-end text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">{getTrainerName(fb.toUserId)}</span>
                      <span className="text-xs text-gray-500">المدرب:</span>
                    </div>
                    <div className="flex items-end gap-1 mb-1 flex-row-reverse justify-end text-right">
                      <span className="mr-2 text-xs text-gray-600 dark:text-gray-400 font-bold">{fb.rating}/5</span>
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={18} className={
                          'inline-block ' + (i <= fb.rating ? 'text-gray-400 fill-gray-400' : 'text-gray-300')
                        } fill={i <= fb.rating ? '#facc15' : 'none'} />
                      ))}
                    </div>
                    <div className="mb-1 text-right flex flex-col ">
                      <span className="text-xs text-gray-500">التعليق:</span>
                      <div className="text-gray-800 dark:text-gray-200 text-sm mt-1 min-h-[1.5em] break-words text-right w-full" style={{direction: 'rtl'}}>{fb.comment || '-'}</div>
                    </div>
                    <div className="flex items-end gap-2 text-xs text-gray-400 mt-2 flex-row-reverse justify-end text-right">
                      <span>{new Date(fb.date).toLocaleDateString()}</span>
                      <span>التاريخ:</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {/* Modal */}
      {showModal && trainer && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200 dark:border-gray-700">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 bg-white dark:bg-gray-800 rounded-full shadow p-1 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"><X size={22} className="text-gray-400 hover:text-red-500" /></button>
            <div className="flex items-center gap-2 mb-6">
              <Star size={28} className="text-gray-400 fill-gray-400 drop-shadow" />
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل التقييم</h4>
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-xs text-gray-500 mb-1">المدرب</div>
                <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">{getTrainerName(selectedFeedback.toUserId)}</div>
              </div>
              <div className="border-t border-dashed border-gray-300 dark:border-gray-700" />
              <div>
                <div className="text-xs text-gray-500 mb-1">التقييم</div>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={28} className={i <= selectedFeedback.rating ? 'text-gray-400 fill-gray-400 drop-shadow' : 'text-gray-300'} fill={i <= selectedFeedback.rating ? '#facc15' : 'none'} />
                  ))}
                  <span className="ml-2 text-base font-bold text-gray-600 dark:text-gray-400">{selectedFeedback.rating}/5</span>
                </div>
              </div>
              <div className="border-t border-dashed border-gray-300 dark:border-gray-700" />
              <div>
                <div className="text-xs text-gray-500 mb-1">التعليق</div>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white whitespace-pre-line break-words max-h-40 overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner">
                  {selectedFeedback.comment || '-'}
                </div>
              </div>
              <div className="border-t border-dashed border-gray-300 dark:border-gray-700" />
              <div>
                <div className="text-xs text-gray-500 mb-1">التاريخ</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">{new Date(selectedFeedback.date).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal for add feedback remains as is */}
      {showModal && !selectedFeedback && trainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute left-3 top-3 text-gray-400 hover:text-red-500"><X size={22} /></button>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">إرسال تقييم للمدرب: {trainer?.name}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <button type="submit" disabled={saving} className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md mt-2">
                {saving ? 'جارٍ الحفظ...' : 'إرسال التقييم'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberFeedback;
