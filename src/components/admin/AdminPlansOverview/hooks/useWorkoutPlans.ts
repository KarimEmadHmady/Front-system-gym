import { useState, useEffect } from 'react';
import { workoutService, userService } from '@/services';
import type { WorkoutPlan } from '@/types';

export const useWorkoutPlans = (
  currentRole: string | undefined,
  currentTrainerId: string
) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);
  const [trainers, setTrainers] = useState<Array<{ _id: string; name: string; email?: string; phone?: string }>>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await workoutService.getAllWorkoutPlans();
        setWorkoutPlans((res as any).data || (res as any));

        try {
          const membersRes = await userService.getUsersByRole('member', { limit: 1000 });
          const raw = (membersRes as any).data || (membersRes as any);
          const list = (raw?.items || raw || []) as any[];
          if (currentRole === 'trainer') {
            const normalizeId = (val: any): string => {
              if (!val) return '';
              if (typeof val === 'string') return val;
              if (typeof val === 'object') return (val._id || val.id || '') as string;
              return String(val);
            };
            setMembers(list.filter((m) => normalizeId((m as any)?.trainerId) === currentTrainerId));
          } else {
            setMembers(list);
          }
        } catch {}

        try {
          const trainersRes = await userService.getUsersByRole('trainer', { limit: 100 });
          const tdata = (trainersRes as any).data || (trainersRes as any);
          setTrainers(tdata?.items || tdata || []);
        } catch {}
      } catch (e: any) {
        setError(e.message || 'فشل تحميل الخطط');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshPlan = async (planId: string) => {
    const plan = await workoutService.getWorkoutPlan(planId);
    setWorkoutPlans((prev) => prev.map((p) => p._id === planId ? plan : p));
    return plan;
  };

  const deletePlan = async (planId: string) => {
    await workoutService.deleteWorkoutPlan(planId);
    setWorkoutPlans((prev) => prev.filter((p) => p._id !== planId));
  };

  const addPlan = (plan: WorkoutPlan) => {
    setWorkoutPlans((prev) => [plan, ...prev.filter((p) => p._id !== plan._id)]);
  };

  const updatePlan = (plan: WorkoutPlan) => {
    setWorkoutPlans((prev) => prev.map((p) => p._id === plan._id ? plan : p));
  };

  return {
    workoutPlans, setWorkoutPlans,
    loading, setLoading,
    error,
    members, trainers,
    refreshPlan, deletePlan, addPlan, updatePlan,
  };
};