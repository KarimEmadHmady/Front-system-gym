// دوال التنسيق المشتركة

export const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'الآن';
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `منذ ${diffInWeeks} أسبوع`;
};

export const getTransactionIcon = (type: string): string => {
  return type === 'revenue' ? '💰' : '💸';
};

export const getTransactionColor = (type: string): string => {
  return type === 'revenue' ? 'text-green-600' : 'text-red-600';
};

export const formatCurrency = (amount: number): string => {
  return `ج.م${new Intl.NumberFormat().format(amount)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-EG');
};