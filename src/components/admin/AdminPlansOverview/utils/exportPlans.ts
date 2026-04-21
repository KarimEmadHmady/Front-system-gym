import * as XLSX from 'xlsx';
import type { WorkoutPlan } from '@/types';
import type { DietPlan } from '@/types';

export const exportWorkoutPlansToExcel = (
  plans: WorkoutPlan[],
  userNameMap: Record<string, string>,
  onSuccess: (t: string, m: string) => void,
  onError: (t: string, m: string) => void
) => {
  try {
    const exportData = plans.map((plan) => ({
      'اسم الخطة': plan.planName || '',
      'المستخدم': userNameMap[plan.userId] || 'غير محدد',
      'المدرب': (plan as any).trainerId ? (userNameMap[(plan as any).trainerId] || 'غير محدد') : 'غير محدد',
      'الوصف': plan.description || '',
      'تاريخ البداية': plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '',
      'تاريخ النهاية': plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '',
      'عدد التمارين': plan.exercises?.length || 0,
      'التدريبات': plan.exercises?.map((ex) =>
        `${ex.name} (${ex.sets} مجموعات × ${ex.reps} تكرار)${ex.notes ? ' - ' + ex.notes : ''}`
      ).join(' | ') || '',
      'تاريخ الإنشاء': plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('ar-EG') : '',
      'آخر تعديل': plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString('ar-EG') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [20, 20, 20, 30, 15, 15, 12, 50, 15, 15].map((wch) => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'خطط التمرين');
    XLSX.writeFile(wb, `خطط_التمرين_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
    onSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} خطة تمرين بنجاح`);
  } catch (e) {
    console.error(e);
    onError('خطأ في التصدير', 'حدث خطأ أثناء تصدير خطط التمرين');
  }
};

export const exportDietPlansToExcel = (
  plans: DietPlan[],
  userNameMap: Record<string, string>,
  onSuccess: (t: string, m: string) => void,
  onError: (t: string, m: string) => void
) => {
  try {
    const exportData = (plans as any[]).map((plan) => ({
      'اسم الخطة': plan.planName || '',
      'المستخدم': userNameMap[plan.userId] || 'غير محدد',
      'المدرب': plan.trainerId ? (userNameMap[plan.trainerId] || 'غير محدد') : 'غير محدد',
      'الوصف': plan.description || '',
      'تاريخ البداية': plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-EG') : '',
      'تاريخ النهاية': plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-EG') : '',
      'عدد الوجبات': plan.meals?.length || 0,
      'الوجبات': plan.meals?.map((meal: any) =>
        `${meal.mealName} (${meal.calories} سعرة حرارية - ${meal.quantity})${meal.notes ? ' - ' + meal.notes : ''}`
      ).join(' | ') || '',
      'تاريخ الإنشاء': plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('ar-EG') : '',
      'آخر تعديل': plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString('ar-EG') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [20, 20, 20, 30, 15, 15, 12, 50, 15, 15].map((wch) => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الخطط الغذائية');
    XLSX.writeFile(wb, `الخطط_الغذائية_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
    onSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} خطة غذائية بنجاح`);
  } catch (e) {
    console.error(e);
    onError('خطأ في التصدير', 'حدث خطأ أثناء تصدير الخطط الغذائية');
  }
};