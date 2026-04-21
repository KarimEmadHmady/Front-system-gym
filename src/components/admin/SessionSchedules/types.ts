export type SessionFormData = {
  userId: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: 'شخصية' | 'جماعية' | 'أونلاين' | 'تغذية';
  location: string;
  price: number;
  description: string;
};

export const INITIAL_FORM: SessionFormData = {
  userId: '',
  trainerId: '',
  date: '',
  startTime: '',
  endTime: '',
  duration: 60,
  sessionType: 'شخصية',
  location: 'Gym',
  price: 0,
  description: '',
};

export type TabId = 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled';

export type TabDef = { id: TabId; name: string; count: number };