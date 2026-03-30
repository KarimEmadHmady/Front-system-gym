"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';

const MemberTrainer: React.FC = () => {
  const router = useRouter();
  const { user: authUser } = usePermissions();
  const [member, setMember] = useState<UserModel | null>(null);
  const [trainer, setTrainer] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userService = new UserService();

  const memberId = (authUser as any)?._id || (authUser as any)?.id || '';

  useEffect(() => {
    const loadTrainer = async () => {
      if (!memberId) return;
      setLoading(true);
      setError(null);
      try {
        const me = await userService.getUser(memberId);
        setMember(me as any);
        const tId = (me as any)?.trainerId;
        if (!tId) {
          setTrainer(null);
          return;
        }
        const t = await userService.getUser(typeof tId === 'object' ? (tId as any)._id : tId);
        setTrainer(t as any);
      } catch {
        setError('تعذر جلب بيانات المدرب');
      } finally {
        setLoading(false);
      }
    };
    loadTrainer();
  }, [memberId]);

  const openMail = (email?: string) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };
  const goToMessage = (trainerId?: string) => {
    if (!trainerId) return;
    router.push(`/member/profile?tab=messages&to=${trainerId}`);
  };
  const goToFeedback = (trainerId?: string) => {
    if (!trainerId) return;
    router.push(`/member/profile?tab=feedback&to=${trainerId}`);
  };

  const trainerIdValue = trainer ? (trainer as any)._id : undefined;

  return (
    <div className="w-full max-w-md mx-auto p-0 sm:p-4">
      <div className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col items-center px-5 py-8 gap-4 transition-all">
        <div className="flex flex-col items-center gap-2 w-full">
          {trainer?.avatarUrl ? (
            <img
              src={trainer.avatarUrl}
              alt={trainer.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-md bg-gray-100"
              onError={e => { const t = e.target as HTMLImageElement; t.style.display = 'none'; const x = t.nextElementSibling as HTMLElement; if (x) x.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-gray-500 flex items-center justify-center text-white text-3xl font-bold shadow-md ${trainer?.avatarUrl ? 'hidden' : ''}`}
            style={{ display: trainer?.avatarUrl ? 'none' : 'flex' }}
          >
            {trainer?.name?.charAt(0) || '?'}
          </div>
          <div className="mt-2 text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{trainer?.name}</h2>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-200 mb-2">{trainer?.role === 'trainer' ? 'مدرب' : trainer?.role}</span>
            <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-100 mt-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">📧</span>
                <span className="break-all">{trainer?.email || '-'}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">📞</span>
                <span>{trainer?.phone || '-'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full mt-4 items-center">
          <button
            onClick={() => goToMessage(trainerIdValue)}
            className="w-full px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-base font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            إرسال رسالة 💬
          </button>
          <button
            onClick={() => goToFeedback(trainerIdValue)}
            className="w-full px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-gray-900 text-base font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            إرسال تقييم ⭐
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberTrainer;


