import { useState, useEffect } from 'react';
import { userService } from '@/services';
import type { WorkoutPlan } from '@/types';
import type { DietPlan } from '@/types';

export const useUserNameMap = (workoutPlans: WorkoutPlan[], dietPlans: DietPlan[]) => {
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadNames = async () => {
      const ids = Array.from(new Set([
        ...(workoutPlans || []).map((p) => p.userId).filter(Boolean),
        ...(workoutPlans || []).map((p: any) => p.trainerId).filter(Boolean),
        ...(dietPlans || []).map((p: any) => p.userId).filter(Boolean),
        ...(dietPlans || []).map((p: any) => p.trainerId).filter(Boolean),
      ]));
      const missing = ids.filter((id) => !userNameMap[id]);
      if (missing.length === 0) return;
      try {
        const pairs = await Promise.all(
          missing.map(async (id) => {
            try {
              const u = await userService.getUser(id);
              return [id, u.name] as const;
            } catch {
              return [id, id] as const;
            }
          })
        );
        setUserNameMap((prev) => ({ ...prev, ...Object.fromEntries(pairs) }));
      } catch {}
    };
    loadNames();
  }, [workoutPlans, dietPlans]); // eslint-disable-line react-hooks/exhaustive-deps

  return { userNameMap };
};