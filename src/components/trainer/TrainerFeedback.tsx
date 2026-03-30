'use client';

import React, { useEffect, useState } from 'react';
import { getFeedbackForUser } from '@/services/feedbackService';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Feedback, User } from '@/types/models';
import { Star, X } from 'lucide-react';

const TrainerFeedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const [feedbackList, membersRes, trainersRes, adminsRes, managersRes] = await Promise.all([
          getFeedbackForUser(user.id),
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
  }, [user]);

  const getUserName = (id?: string) => {
    if (!id) return 'مجهول';
    const u = users.find(u => (u._id === id) || ((u as any).id === id) || (String(u._id) === String(id)));
    return u ? u.name : 'غير معروف';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">التقييمات الخاصة بي</h3>
      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">لا توجد تقييمات بعد.</div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <div 
              key={fb._id} 
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              onClick={() => { setSelectedFeedback(fb); setShowModal(true); }}
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserName(fb.fromUserId).charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{getUserName(fb.fromUserId)}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(fb.date).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} className={
                      'inline-block ' + (i <= fb.rating ? 'text-gray-400 fill-gray-400' : 'text-gray-300')
                    } fill={i <= fb.rating ? '#facc15' : 'none'} />
                  ))}
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 mr-1">{fb.rating}/5</span>
                </div>
              </div>
              
              {fb.comment && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{fb.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-40">
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200 dark:border-gray-700">
            <button onClick={() => setShowModal(false)} className="absolute left-4 top-4 bg-white dark:bg-gray-800 rounded-full shadow p-1 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"><X size={22} className="text-gray-400 hover:text-red-500" /></button>
            <div className="flex items-center gap-2 mb-6">
              <Star size={28} className="text-gray-400 fill-gray-400 drop-shadow" />
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل التقييم</h4>
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-xs text-gray-500 mb-1">المرسل</div>
                <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">{getUserName(selectedFeedback.fromUserId)}</div>
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
    </div>
  );
};

export default TrainerFeedback;


