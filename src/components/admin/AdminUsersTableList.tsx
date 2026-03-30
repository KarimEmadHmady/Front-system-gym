import React, { useState, useRef, useEffect } from 'react';
import type { User as UserModel } from '@/types/models';
import UserSubscriptionAlert from './UserSubscriptionAlert';
import AlertResetButton from './AlertResetButton';

interface AdminUsersTableListProps {
  users: UserModel[];
  loading: boolean;
  error?: string | null;
  openViewUser: (id: string) => void;
  canEdit: boolean;
  canChangeRole: boolean;
  canDelete: boolean;
  canHardDelete: boolean;
  handleEdit: (id: string) => void;
  handleChangeRole: (id: string, role: string) => void;
  openDeleteModal: (id: string, type: 'soft' | 'hard') => void;
  getRoleText: (role: string) => string;
  getRoleColor: (role: string) => string;
  getStatusColor: (status: string) => string;
  getSubscriptionColor: (status: string) => string;
}

const AdminUsersTableList: React.FC<AdminUsersTableListProps> = ({
  users,
  loading,
  error,
  openViewUser,
  canEdit,
  canChangeRole,
  canDelete,
  canHardDelete,
  handleEdit,
  handleChangeRole,
  openDeleteModal,
  getRoleText,
  getRoleColor,
  getStatusColor,
  getSubscriptionColor,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [showTopScroll, setShowTopScroll] = useState(false);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const updateHint = () => {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setShowScrollHint(hasOverflow);
      setShowTopScroll(hasOverflow);
      setTableScrollWidth(container.scrollWidth);
      if (!hasOverflow) return;

      window.setTimeout(() => setShowScrollHint(false), 4000);
    };

    updateHint();

    const onScroll = () => {
      setShowScrollHint(false);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateHint);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateHint);
    };
  }, [users]);

  useEffect(() => {
    const container = tableContainerRef.current;
    const topScroll = topScrollRef.current;
    if (!container || !topScroll) return;

    const syncTopFromTable = () => {
      topScroll.scrollLeft = container.scrollLeft;
    };
    const syncTableFromTop = () => {
      container.scrollLeft = topScroll.scrollLeft;
    };

    container.addEventListener('scroll', syncTopFromTable, { passive: true });
    topScroll.addEventListener('scroll', syncTableFromTop, { passive: true });

    return () => {
      container.removeEventListener('scroll', syncTopFromTable);
      topScroll.removeEventListener('scroll', syncTableFromTop);
    };
  }, [showTopScroll, users]);

  const handleDismissAlert = (userId: string) => {
    setDismissedAlerts(prev => new Set([...prev, userId]));
  };

  return (
  <div className="relative">
      {showTopScroll && (
        <div
          ref={topScrollRef}
          className="overflow-x-auto mb-2 h-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          style={{ overscrollBehaviorX: 'none' }}
        >
          <div style={{ width: tableScrollWidth, height: 1 }} />
        </div>
      )}
      <div ref={tableContainerRef} className="relative overflow-x-auto">
        {showScrollHint && (
          <div
            className="pointer-events-none absolute right-4 top-4 z-40 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs text-white"
            style={{ animation: 'swipeHint 4s ease forwards' }}
          >
            <span>👆</span>
            <span>اسحب الجدول لليسار/اليمين لعرض البيانات المتبقية</span>
          </div>
        )}
    {/* زر إعادة تعيين التحذيرات */}
    {dismissedAlerts.size > 0 && (
      <div className="mb-4 flex justify-end">
        <AlertResetButton 
          onReset={() => setDismissedAlerts(new Set())}
          className="text-xs"
        />
      </div>
    )}
    
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">المستخدم</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">الدور</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">الحالة</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">الاشتراك</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">الرصيد</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">آخر دخول</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">الإجراءات</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <tr><td colSpan={8} className="text-center py-8">جاري التحميل...</td></tr>
        ) : error ? (
          <tr>
            <td colSpan={8} className="text-center py-8 text-red-600 dark:text-red-400">
              {error}
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr><td colSpan={8} className="text-center py-8">لا يوجد مستخدمين</td></tr>
        ) : users.map((user) => (
          <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => openViewUser(user._id)}>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      // إذا فشل تحميل الصورة، اعرض الحرف الأول
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold ${user.avatarUrl ? 'hidden' : ''}`}
                  style={{ display: user.avatarUrl ? 'none' : 'flex' }}
                >
                  {user.name.charAt(0)}
                </div>
                <div className="mr-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
                {!dismissedAlerts.has(user._id) && (
                  <UserSubscriptionAlert 
                    user={user} 
                    size="sm" 
                    dismissible={true}
                    onDismiss={() => handleDismissAlert(user._id)}
                  />
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>{getRoleText(user.role)}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>{user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'محظور'}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(user.subscriptionStatus)}`}>{user.subscriptionStatus === 'active' ? 'نشط' : user.subscriptionStatus === 'expired' ? 'منتهي' : user.subscriptionStatus === 'cancelled' ? 'ملغي' : 'مجمد'}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">ج.م{user.balance}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('ar-EG') : '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative z-30 text-center">
              <div className="flex space-x-2 relative z-30">
                {canEdit && (
                  <button onClick={e => { e.stopPropagation(); handleEdit(user._id); }} className="relative z-30 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 group p-3 cursor-pointer  rounded-md">
                    <span className="relative z-30">تعديل</span>
                    <span className="absolute inset-0 bg-gray-600/10 group-hover:bg-gray-600/20 rounded transition-all z-20 pointer-events-none"></span>
                  </button>
                )}
                {canChangeRole && (
                  <button onClick={e => { e.stopPropagation(); handleChangeRole(user._id, user.role); }} className="relative z-30 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 group p-3 cursor-pointer  rounded-md">
                    <span className="relative z-30">تغيير دور</span>
                    <span className="absolute inset-0 bg-gray-400/10 group-hover:bg-gray-400/20 rounded transition-all z-20 pointer-events-none"></span>
                  </button>
                )}
                {canDelete && (
                  <button onClick={e => { e.stopPropagation(); openDeleteModal(user._id, 'soft'); }} className="relative z-30 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 group p-3 cursor-pointer  rounded-md">
                    <span className="relative z-30">حذف</span>
                    <span className="absolute inset-0 bg-red-600/10 group-hover:bg-red-600/20 rounded transition-all z-20 pointer-events-none"></span>
                  </button>
                )}
                {canHardDelete && (
                  <button onClick={e => { e.stopPropagation(); openDeleteModal(user._id, 'hard'); }} className="relative z-30 text-red-800 hover:text-red-900 font-bold group p-3 cursor-pointer  rounded-md">
                    <span className="relative z-30">حذف نهائي</span>
                    <span className="absolute inset-0 bg-red-800/10 group-hover:bg-red-800/20 rounded transition-all z-20 pointer-events-none"></span>
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <style jsx global>{`
      @keyframes swipeHint {
        0% { opacity: 0; transform: translateX(8px); }
        10% { opacity: 1; transform: translateX(0); }
        90% { opacity: 1; }
        100% { opacity: 0; transform: translateX(-8px); }
      }
    `}</style>
    </div>
  </div>
  );
};

export default AdminUsersTableList;
