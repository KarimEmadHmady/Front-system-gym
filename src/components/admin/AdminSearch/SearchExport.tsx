import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SearchResult {
  type: string;
  id: string;
  amount: number;
  date: string;
  userId?: string;
  employeeId?: string;
  method?: string;
  sourceType?: string;
  category?: string;
  status?: string;
  invoiceNumber?: string;
  itemName?: string;
  notes?: string;
  bonuses?: number;
  deductions?: number;
  raw: any;
}

interface SearchExportProps {
  displayedResults: SearchResult[];
  getUserInfo: (userId: string) => { name: string; phone: string };
}

const SearchExport: React.FC<SearchExportProps> = ({
  displayedResults,
  getUserInfo
}) => {
  const handleExportToExcel = () => {
    const exportData = displayedResults.map((result) => {
      const userInfo = result.userId ? getUserInfo(result.userId) : null;
      const dateObj = new Date(result.date);
      
      return {
        'نوع المعاملة': result.type === 'revenue' ? 'إيراد' : 
                           result.type === 'expense' ? 'مصروف' : 
                           result.type === 'invoice' ? 'فاتورة' : 
                           result.type === 'payroll' ? 'راتب' : 
                           result.type === 'payment' ? 'دفعة' : 'شراء',
        'المبلغ (ج.م)': result.amount,
        'التاريخ': dateObj.toLocaleDateString('en-GB'),
        'الساعة': dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        'اسم المستخدم': userInfo?.name || '-',
        'هاتف المستخدم': userInfo?.phone || '-',
        'رقم الفاتورة': result.invoiceNumber || '-',
        'اسم المنتج': result.itemName || '-',
        'طريقة الدفع': result.method || '-',
        'الحالة': result.status || '-',
        'الفئة': result.category || '-',
        'نوع المصدر': result.sourceType || '-',
        'المكافآت': result.bonuses || '-',
        'الخصومات': result.deductions || '-',
        'ملاحظات': result.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج_البحث');
    
    // تصدير الملف
    const fileName = `نتائج_البحث_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <button
      onClick={handleExportToExcel}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs sm:text-sm"
    >
      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
      تصدير Excel
    </button>
  );
};

export default SearchExport;
