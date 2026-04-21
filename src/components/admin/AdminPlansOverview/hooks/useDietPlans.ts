import { useState, useEffect } from 'react';
import { dietService } from '@/services';
import type { DietPlan } from '@/types';

export const useDietPlans = () => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState<string | null>(null);
  const [dietMealsLoading, setDietMealsLoading] = useState(false);
  const [dietMealsError, setDietMealsError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setDietLoading(true);
        setDietError(null);
        const res: any = await dietService.getDietPlans();
        setDietPlans((res?.data || res || []) as DietPlan[]);
      } catch (e: any) {
        setDietError(e.message || 'فشل تحميل الخطط الغذائية');
      } finally {
        setDietLoading(false);
      }
    };
    fetch();
  }, []);

  const refreshDietPlan = async (planId: string): Promise<DietPlan> => {
    const res = await dietService.getDietPlan(planId);
    setDietPlans((prev) => prev.map((p) => p._id === planId ? res : p));
    return res;
  };

  const addDietPlan = (plan: DietPlan) => {
    setDietPlans((prev) => [plan, ...prev]);
  };

  const deleteDietPlan = async (planId: string) => {
    await dietService.deleteDietPlan(planId);
    setDietPlans((prev) => prev.filter((p) => p._id !== planId));
  };

  return {
    dietPlans, setDietPlans,
    dietLoading, dietError,
    dietMealsLoading, setDietMealsLoading,
    dietMealsError, setDietMealsError,
    refreshDietPlan, addDietPlan, deleteDietPlan,
  };
};