export const getUserName = (userId: string, members: any[], currentUser: any) => {
  const user = members.find(u => u._id === userId) || (currentUser && (currentUser.id === userId ? currentUser : null));
  return user ? user.name : 'مستخدم غير معروف';
};

export const getUserEmail = (userId: string, members: any[], currentUser: any) => {
  const user = members.find(u => u._id === userId) || (currentUser && (currentUser.id === userId ? currentUser : null));
  return user ? user.email : '';
};

export const getUserPhone = (userId: string, members: any[], currentUser: any) => {
  const user = members.find(u => u._id === userId) || (currentUser && (currentUser.id === userId ? currentUser : null));
  return user ? (user.phone || '') : '';
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
