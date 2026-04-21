export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'مكتملة': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'مجدولة': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'ملغاة': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'شخصية': '👤',
    'جماعية': '👥',
    'أونلاين': '💻',
    'تغذية': '🥗',
  };
  return icons[type] || '👤';
};