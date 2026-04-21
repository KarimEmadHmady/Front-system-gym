import type { ClientProgress, User } from '@/types/models';

export type TrainerRow = {
  trainer: User;
  clientsCount: number;
  progressCount: number;
  latestProgressDate?: string;
};

export type AddProgressFormData = {
  userId: string;
  date: string;
  weight: string;
  bodyFat: string;
  notes: string;
};

export type EditProgressData = {
  date: string;
  weight: string;
  bodyFat: string;
  notes: string;
};