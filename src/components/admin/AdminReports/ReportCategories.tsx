import React from 'react';

interface ReportCategoriesProps {
  reports: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  activeReport: string;
  onSetActiveReport: (id: string) => void;
}

const ReportCategories: React.FC<ReportCategoriesProps> = ({
  reports,
  activeReport,
  onSetActiveReport
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">أنواع التقارير</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => onSetActiveReport(report.id)}
            className={`p-4 rounded-lg border-2 text-right transition-all ${
              activeReport === report.id
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{report.icon}</span>
              <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportCategories;
