import * as XLSX from 'xlsx';

export const formatDate = (val: any): string => {
  if (!val) return '-';
  const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val instanceof Date ? val : null;
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleString('ar-EG');
};

export const formatDateShort = (val: any): string => {
  if (!val) return '-';
  const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val instanceof Date ? val : null;
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('ar-EG');
};

export const calcAge = (dob: any): string => {
  if (!dob) return '-';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '-';
  const diff = Date.now() - d.getTime();
  const ageDt = new Date(diff);
  return String(Math.abs(ageDt.getUTCFullYear() - 1970));
};

export const calcBMI = (weightKg?: number, heightCm?: number): string => {
  if (!weightKg || !heightCm) return '-';
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  return bmi ? bmi.toFixed(1) : '-';
};

export const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status: string) => {
  const texts = {
    active: 'نشط',
    inactive: 'غير نشط',
    suspended: 'معلق'
  };
  return texts[status as keyof typeof texts] || status;
};

export const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 60) return 'bg-gray-500';
  return 'bg-red-500';
};

export const handleExport = (filteredClients: any[]) => {
  // Prepare data for export (same fields as grid)
  const data = filteredClients.map(client => ({
    'الاسم': client.name,
    'البريد الإلكتروني': client.email,
    'رقم الهاتف': client.phone || '-',
    'الحالة': getStatusText(client.status),
    'بداية الاشتراك': formatDateShort((client as any).subscriptionStartDate),
    'نهاية الاشتراك': formatDateShort((client as any).subscriptionEndDate),
    'الوزن (ابتدائي)': (client as any).baselineWeightKg ?? '-',
    'الوزن المستهدف': (client as any).targetWeightKg ?? '-',
    'الطول (سم)': (client as any).heightCm ?? (client as any).metadata?.heightCm ?? '-',
    'العمر': calcAge(client.dob),
    'نقاط الولاء': client.loyaltyPoints,
    'Freeze Days': (client as any).subscriptionFreezeDays ?? 0,
    'Freeze Used': (client as any).subscriptionFreezeUsed ?? 0,
    'الأهداف': client.goals && Object.entries(client.goals).filter(([_, v]) => v).map(([k]) => k === 'weightLoss' ? 'تخسيس' : k === 'muscleGain' ? 'بناء عضلات' : k === 'endurance' ? 'قوة تحمل' : k).join(', ') || 'لا يوجد أهداف',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');
  XLSX.writeFile(wb, 'clients_export.xlsx');
};
