import type { User } from '@/types/models';

export const getUserName = (userId: string, trainer: User | null, currentUser: any) => {
  if (trainer && trainer._id === userId) return trainer.name;
  if (currentUser?.id === userId) return currentUser.name;
  return 'مستخدم غير معروف';
};

export const getUserEmail = (userId: string, trainer: User | null, currentUser: any) => {
  if (trainer && trainer._id === userId) return trainer.email;
  if (currentUser?.id === userId) return currentUser.email;
  return '';
};

export const getUserPhone = (userId: string, trainer: User | null, currentUser: any) => {
  if (trainer && trainer._id === userId) return (trainer as any).phone || '';
  if (currentUser?.id === userId) return (currentUser as any).phone || '';
  return '';
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
