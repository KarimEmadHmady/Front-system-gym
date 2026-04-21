export const formatDate = (date: string | Date) => {
  if (!date) return 'تاريخ غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatProgressValue = (value: number | null | undefined, unit: string) => {
  if (value === null || value === undefined) return 'غير محدد';
  return `${value} ${unit}`;
};

export const getProgressStatus = (progress: any) => {
  const now = new Date();
  const progressDate = new Date(progress.date);
  const daysDiff = Math.floor((now.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return { text: 'اليوم', color: 'text-green-600' };
  if (daysDiff === 1) return { text: 'أمس', color: 'text-blue-600' };
  if (daysDiff <= 7) return { text: `${daysDiff} أيام`, color: 'text-gray-600' };
  if (daysDiff <= 30) return { text: `${Math.floor(daysDiff / 7)} أسابيع`, color: 'text-gray-600' };
  return { text: `${Math.floor(daysDiff / 30)} أشهر`, color: 'text-gray-600' };
};
