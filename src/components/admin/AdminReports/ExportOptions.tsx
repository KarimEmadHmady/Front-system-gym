import React from 'react';
import * as XLSX from 'xlsx';

interface ExportOptionsProps {
  activeReport: string;
  financialSummary: {
    monthly: Array<{
      year: number;
      month: number;
      revenue: number;
      expense: number;
      netProfit: number;
      payroll: number;
    }>;
  } | null;
  users: any[];
  sessions: any[];
  workoutPlans: any[];
  dietPlans: any[];
  attendanceRecords: any[];
  loyaltyStats: {
    topUsers: Array<{
      _id: string;
      name: string;
      email: string;
      loyaltyPoints: number;
      avatarUrl?: string;
    }>;
  } | null;
  getUserInfo: (userId: string) => { name: string; phone: string };
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  activeReport,
  financialSummary,
  users,
  sessions,
  workoutPlans,
  dietPlans,
  attendanceRecords,
  loyaltyStats,
  getUserInfo,
  showSuccess,
  showWarning,
  showError
}) => {
  const exportCurrentTabToExcel = () => {
    try {
      let exportData: any[] = [];
      let fileName = '';
      switch (activeReport) {
        case 'financial':
          if (financialSummary && financialSummary.monthly) {
            exportData = financialSummary.monthly.map((m: any) => ({
              'الشهر': m.month,
              'السنة': m.year,
              'الإيرادات': m.revenue,
              'المصروفات': m.expense,
              'الربح الصافي': m.netProfit,
              'الرواتب': m.payroll
            }));
            fileName = 'تقرير_المالية.xlsx';
          }
          break;
        case 'users':
          exportData = users.map((u: any) => ({
            'الاسم': u.name,
            'البريد الإلكتروني': u.email,
            'رقم الهاتف': u.phone,
            'الحالة': u.status === 'active' ? 'نشط' : 'غير نشط',
            'تاريخ التسجيل': u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '',
            'الدور': u.role || '',
          }));
          fileName = 'تقرير_المستخدمين.xlsx';
          break;
        case 'sessions':
          exportData = sessions.map((s: any) => ({
            'نوع الحصة': s.sessionType || '',
            'المستخدم': getUserInfo(s.userId).name,
            'المدرب': getUserInfo(s.trainerId).name,
            'التاريخ': s.date ? new Date(s.date).toLocaleDateString('ar-EG') : '',
            'وقت البداية': s.startTime || '',
            'وقت النهاية': s.endTime || '',
            'المدة (دقيقة)': s.duration || 0,
            'السعر (ج.م)': s.price || 0,
            'الموقع': s.location || '',
            'الحالة': s.status || '',
            'الوصف': s.description || '',
          }));
          fileName = 'تقرير_الحصص.xlsx';
          break;
        case 'plans':
          exportData = [
            ...workoutPlans.map((plan: any) => ({
              'نوع الخطة': 'تمرين',
              'اسم الخطة': plan.planName,
              'المستخدم': getUserInfo(plan.userId).name,
              'تاريخ البداية': plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '',
              'تاريخ النهاية': plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '',
            })),
            ...dietPlans.map((plan: any) => ({
              'نوع الخطة': 'غذائية',
              'اسم الخطة': plan.planName,
              'المستخدم': getUserInfo(plan.userId).name,
              'تاريخ البداية': plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '',
              'تاريخ النهاية': plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '',
            })),
          ];
          fileName = 'تقرير_الخطط.xlsx';
          break;
        case 'attendance':
          exportData = attendanceRecords.map((a: any) => ({
            'الاسم': getUserInfo(a.userId).name,
            'رقم الهاتف': getUserInfo(a.userId).phone,
            'التاريخ': a.date ? new Date(a.date).toLocaleDateString('ar-EG') : '',
            'الحالة': a.status === 'present' ? 'حضور' : a.status === 'absent' ? 'غياب' : 'إعفاء',
          }));
          fileName = 'تقرير_الحضور.xlsx';
          break;
        case 'loyalty':
          if (loyaltyStats && loyaltyStats.topUsers) {
            exportData = loyaltyStats.topUsers.map((u: any) => ({
              'الاسم': u.name,
              'البريد الإلكتروني': u.email,
              'نقاط الولاء': u.loyaltyPoints,
            }));
            fileName = 'تقرير_الولاء.xlsx';
          }
          break;
        default:
          showWarning('تنبيه', 'يرجى اختيار تقرير صالح');
          return;
      }
      if (!exportData || exportData.length === 0) {
        showWarning('تنبيه', 'لا توجد بيانات متاحة للتصدير');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير');
      worksheet['!cols'] = Object.keys(exportData[0]).map(() => ({ wch: 20 }));
      XLSX.writeFile(workbook, fileName);
      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} سجل بنجاح`);
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير التقرير');
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">تصدير التقرير</h4>
      <div className="flex space-x-4">
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors" 
          onClick={exportCurrentTabToExcel}
        >
          تصدير Excel
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;
