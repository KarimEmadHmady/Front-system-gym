import * as XLSX from 'xlsx';

export const handleExport = (records: any[], fileName: string) => {
  const data = records.map(rec => {
    const d = new Date(rec.date);
    return {
      'التاريخ': d.toLocaleDateString(),
      'الساعة': d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      'الحالة': rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر',
      'ملاحظات': rec.notes || '-',
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, fileName);
};

export const handleExportClientRecords = (records: any[], selectedClient: any, clients: any[]) => {
  if (!selectedClient || records.length === 0) return;
  const selectedClientData = clients.find(c => c._id === selectedClient);
  const data = records.map(rec => {
    const d = new Date(rec.date);
    return {
      'العميل': selectedClientData?.name || '-',
      'التاريخ': d.toLocaleDateString(),
      'الساعة': d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      'الحالة': rec.status === 'present' ? 'حاضر' : rec.status === 'absent' ? 'غائب' : 'بعذر',
      'ملاحظات': rec.notes || '-',
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ClientAttendance');
  XLSX.writeFile(wb, `client_attendance_${selectedClientData?.name || 'unknown'}.xlsx`);
};

export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'present':
      return { icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-100', text: 'حاضر' };
    case 'absent':
      return { icon: 'XCircle', color: 'text-red-600', bgColor: 'bg-red-100', text: 'غائب' };
    case 'excused':
      return { icon: 'AlertCircle', color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'بعذر' };
    default:
      return { icon: 'AlertCircle', color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'غير محدد' };
  }
};
