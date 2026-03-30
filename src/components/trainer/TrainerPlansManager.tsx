'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminPlansOverview from '@/components/admin/AdminPlansOverview';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';

const TrainerPlansManager = () => {
  const { user } = useAuth();
  const currentTrainerId = useMemo(() => ((user as any)?._id ?? (user as any)?.id ?? ''), [user]);
  const [clientIds, setClientIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const userService = new UserService();
        const membersRes: any = await userService.getUsersByRole('member', { page: 1, limit: 1000 });
        const arr = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
        const normalizeId = (val: any): string => {
          if (!val) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'object') return (val._id || val.id || '') as string;
          return String(val);
        };
        const me = normalizeId(currentTrainerId);
        const filtered = (arr || []).filter((m: any) => normalizeId(m?.trainerId) === me);
        setClientIds(new Set(filtered.map((c: any) => normalizeId(c?._id))));
      } catch {
        setClientIds(new Set());
      }
    };
    if (currentTrainerId) fetchClients();
  }, [currentTrainerId]);

  return <AdminPlansOverview filterUserIds={clientIds} />;
};

export default TrainerPlansManager;


