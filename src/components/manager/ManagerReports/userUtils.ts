import type { User } from '@/types/models';

let usersCache: User[] = [];

export const setUsersCache = (users: User[]) => {
  usersCache = users;
};

export const getUserInfo = (userId: string) => {
  const user = usersCache.find(u => u._id === userId);
  if (!user) return { name: `غير معروف (${userId})`, phone: '' };
  return { name: user.name, phone: user.phone || '' };
};
