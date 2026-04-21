// 'use client';

// import React from 'react';
// import type { TabDef, TabId } from './types';
// import type { SessionSchedule } from '@/types';
// type Props = {
//   tabs: TabDef[];
//   activeTab: TabId;
//   onTabChange: (id: TabId) => void;
// };

// const SessionsTabs = ({ tabs, activeTab, onTabChange }: Props) => {
//   const tabClass = (id: string) =>
//     `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
//       activeTab === id
//         ? 'border-gray-500 text-gray-600 dark:text-gray-400'
//         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
//     }`;

//   const badge = (count: number) => (
//     <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0 px-2 mx-2 rounded-full text-xs">
//       {count}
//     </span>
//   );

//   return (
//     <div className="border-b border-gray-200 dark:border-gray-700">
//       {/* Mobile */}
//       <div className="md:hidden w-full pb-2">
//         <nav className="flex flex-col space-y-2 px-2 py-2">
//           {tabs.map(tab => (
//             <button key={tab.id} onClick={() => onTabChange(tab.id)} className={tabClass(tab.id) + ' mb-4'}>
//               {tab.name}{badge(tab.count)}
//             </button>
//           ))}
//         </nav>
//       </div>
//       {/* Desktop */}
//       <nav className="hidden md:flex space-x-8 px-6 justify-center flex-wrap">
//         {tabs.map(tab => (
//           <button key={tab.id} onClick={() => onTabChange(tab.id)} className={tabClass(tab.id)}>
//             {tab.name}{badge(tab.count)}
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default SessionsTabs;






'use client';

import React from 'react';
import type { SessionSchedule } from '@/types';
import { getStatusColor, getTypeIcon } from './helpers';

type Props = {
  sessions: SessionSchedule[];
  getUserName: (id: string) => string;
  onEdit: (s: SessionSchedule) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'مجدولة' | 'مكتملة' | 'ملغاة') => void;
};

const SessionsTable = ({ sessions, getUserName, onEdit, onDelete, onUpdateStatus }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              نوع الحصة
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              المتدرب
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              المدرب
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              التاريخ والوقت
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              المدة
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              السعر
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الحالة
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sessions.map((session) => (
            <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getTypeIcon(session.sessionType)}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.sessionType}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                {getUserName(session.userId)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                {getUserName(session.trainerId)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                <div>
                  <div>{new Date(session.date).toLocaleDateString('ar-EG')}</div>
                  <div className="text-gray-500">{session.startTime} - {session.endTime}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                {session.duration} دقيقة
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400 text-center">
                ج.م {session.price || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={() => onEdit(session)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    تعديل
                  </button>
                  {session.status === 'مجدولة' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(session._id, 'مكتملة')}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        إكمال
                      </button>
                      <button
                        onClick={() => onUpdateStatus(session._id, 'ملغاة')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        إلغاء
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete(session._id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionsTable; 
