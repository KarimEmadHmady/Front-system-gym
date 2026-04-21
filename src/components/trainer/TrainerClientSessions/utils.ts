import * as XLSX from 'xlsx';

export const handleExport = (sessions: any[], clients: any[]) => {
  const data = sessions.map(session => {
    const client = clients.find(c => c._id === session.userId);
    return {
      'اسم العميل': client?.name || 'غير محدد',
      'رقم الهاتف': client?.phone || '-',
      'نوع الحصة': session.sessionType,
      'التاريخ': new Date(session.date).toLocaleDateString('ar-EG'),
      'وقت البداية': session.startTime,
      'وقت النهاية': session.endTime,
      'المدة': session.duration || '-',
      'السعر': session.price || 0,
      'الحالة': session.status,
      'الوصف': session.description || '-',
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sessions');
  XLSX.writeFile(wb, 'client_sessions.xlsx');
};

export const getStatusColor = (status: string) => {
  const colors = {
    'مكتملة': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'مجدولة': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'ملغاة': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status: string) => {
  return status; // Already in Arabic from API
};

export const getUserName = (userId: string, clients: any[]) => {
  if (!userId || !clients || clients.length === 0) {
    return 'غير محدد';
  }
  const normalize = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return (val._id || val.id || '') as string;
    return String(val);
  };
  const searchId = normalize(userId);
  const user = clients.find(u => normalize(u._id) === searchId || normalize((u as any).id) === searchId);
  return user?.name || 'غير محدد';
};

export const getUserPhone = (userId: string, clients: any[]) => {
  if (!userId || !clients || clients.length === 0) {
    return '';
  }
  const normalize = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return (val._id || val.id || '') as string;
    return String(val);
  };
  const searchId = normalize(userId);
  const user = clients.find(u => normalize(u._id) === searchId || normalize((u as any).id) === searchId);
  return (user?.phone as string) || '';
};

export const getTypeIcon = (type: string) => {
  const icons = {
    'شخصية': '👤',
    'جماعية': '👥',
    'أونلاين': '💻',
    'تغذية': '🥗'
  };
  return icons[type as keyof typeof icons] || '👤';
};
