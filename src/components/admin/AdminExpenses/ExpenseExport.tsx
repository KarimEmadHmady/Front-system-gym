'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import type { Expense } from '@/types';
import { useCustomAlert } from '@/hooks/useCustomAlert';

interface ExpenseExportProps {
  displayedItems: Expense[];
}

const ExpenseExport: React.FC<ExpenseExportProps> = ({ displayedItems }) => {
  const { showSuccess, showError } = useCustomAlert();

  const exportExpensesToExcel = () => {
    try {
      const exportData = displayedItems.map(row => {
        return {
          'date': row.date ? new Date(row.date).toLocaleDateString('ar-EG') : '',
          'category': row.category || '',
          'amount': row.amount || 0,
          'paidTo': row.paidTo || '-',
          'notes': row.notes || '',
          'createdAt': row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG') : '',
          'updatedAt': row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('ar-EG') : '',
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'المصروفات');
      worksheet['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
      ];
      const fileName = `المصروفات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showSuccess('تم التصدير بنجاح', `تم تصدير ${exportData.length} سجل مصروف بنجاح`);
    } catch (error) {
      console.error('خطأ في تصدير المصروفات:', error);
      showError('خطأ في التصدير', 'حدث خطأ أثناء تصدير المصروفات');
    }
  };

  return (
    <button
      onClick={exportExpensesToExcel}
      disabled={displayedItems.length === 0}
      className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50 shadow hover:bg-green-700 transition-colors"
    >
      تصدير البيانات
    </button>
  );
};

export default ExpenseExport;
