import type { User } from '@/types/models';

let usersCache: User[] = [];

export const setUsersCache = (users: User[]) => {
  usersCache = users;
};

export const getUserName = (userId: string): string => {
  const user = usersCache.find(u => u._id === userId);
  return user ? user.name : 'مستخدم غير معروف';
};

export const getUserEmail = (userId: string): string => {
  const user = usersCache.find(u => u._id === userId);
  return user ? user.email : '';
};

export const getUserPhone = (userId: string): string => {
  const user = usersCache.find(u => u._id === userId);
  return user ? (user.phone || '') : '';
};
