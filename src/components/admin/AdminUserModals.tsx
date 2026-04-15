import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';

// دالة لتنسيق التاريخ والوقت بشكل مقروء
function formatDateTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

interface AdminUserModalsProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (v: boolean) => void;
  isSubmitting: boolean;
  formError: string | null;
  newUser: any;
  handleCreateChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCreateSubmit: (e: React.FormEvent) => void;

  isRoleOpen: boolean;
  roleUser: UserModel | null;
  roleForm: string;
  setRoleForm: (v: string) => void;
  roleError: string | null;
  isRoleSubmitting: boolean;
  setIsRoleOpen: (v: boolean) => void;
  handleRoleSubmit: (e: React.FormEvent) => void;

  isEditOpen: boolean;
  editUser: UserModel | null;
  editForm: any;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  isEditSubmitting: boolean;
  editError: string | null;
  setIsEditOpen: (v: boolean) => void;

  isDeleteOpen: boolean;
  setIsDeleteOpen: (v: boolean) => void;
  deleteType: 'soft' | 'hard';
  confirmDelete: () => void;

  isViewOpen: boolean;
  setIsViewOpen: (v: boolean) => void;
  viewUser: any;
  viewLoading: boolean;
  userViewFields: { key: string; label: string; type?: 'object' }[];
}

const AdminUserModals: React.FC<AdminUserModalsProps> = (props) => {
  const userSvc = useMemo(() => new UserService(), []);
  const [trainers, setTrainers] = useState<UserModel[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const trainersLoadedRef = useRef(false);
  const [resolvedTrainerName, setResolvedTrainerName] = useState<string | null>(null);
  const resolvedTrainerIdRef = useRef<string | null>(null);

  const normalizeId = (v: unknown): string | null => {
    if (!v) return null;
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'object') {
      const obj = v as any;
      if (typeof obj._id === 'string') return obj._id.trim();
      if (typeof obj.id === 'string') return obj.id.trim();
    }
    return null;
  };
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false); // للحالة الجديدة
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load trainers only when a modal that needs it is open.
    const needsTrainers = props.isEditOpen || props.isCreateOpen || props.isViewOpen;
    if (!needsTrainers) return;
    if (trainersLoadedRef.current) return;

    const loadTrainers = async () => {
      setLoadingTrainers(true);
      try {
        const res = await userSvc.getUsersByRole('trainer', { page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' } as any);
        const arr = Array.isArray(res) ? (res as unknown as UserModel[]) : ((res as any)?.data || []);
        setTrainers(arr);
        trainersLoadedRef.current = true;
      } catch {
        setTrainers([]);
      } finally {
        setLoadingTrainers(false);
      }
    };
    loadTrainers();
  }, [props.isEditOpen, props.isCreateOpen, props.isViewOpen, userSvc]);

  useEffect(() => {
    // sync preview with current user/modal data
    const url = (props.viewUser?.avatarUrl || props.editForm?.avatarUrl || '') as string;
    setAvatarPreviewUrl(url || null);
  }, [props.viewUser, props.editForm]);

  // Resolve trainer name for View modal (if trainerId is an id and not populated)
  useEffect(() => {
    if (!props.isViewOpen) return;
    const raw = props.viewUser?.trainerId;

    // If backend already populated trainerId with name, use it directly.
    if (raw && typeof raw === 'object') {
      const directName =
        (raw as any).name ?? (raw as any).fullName ?? (raw as any).trainerName ?? null;
      if (directName) {
        setResolvedTrainerName(directName);
        resolvedTrainerIdRef.current = normalizeId(raw);
        return;
      }
    }

    const trainerId = normalizeId(raw);

    if (!trainerId) {
      setResolvedTrainerName(null);
      resolvedTrainerIdRef.current = null;
      return;
    }

    // If trainers list already contains it, use it.
    const matched = trainers.find((t) => normalizeId(t._id) === trainerId);
    if (matched?.name) {
      setResolvedTrainerName(matched.name);
      resolvedTrainerIdRef.current = trainerId;
      return;
    }

    // Avoid duplicate requests for the same id.
    if (resolvedTrainerIdRef.current === trainerId) return;
    resolvedTrainerIdRef.current = trainerId;

    setResolvedTrainerName(null);
    userSvc
      .getUser(trainerId)
      .then((u) => setResolvedTrainerName(u?.name ?? null))
      .catch(() => setResolvedTrainerName(null));
  }, [props.isViewOpen, props.viewUser?.trainerId, trainers, userSvc]);

  // نسخ كل JSX المودالز من الكود الأصلي هنا مع تمرير props
  // ... سيتم نقل كل مودال كما هو مع استخدام props
  // لتوفير الوقت، يمكن نقل الكود مباشرة من الكومبوننت الأصلي
  return <>
    {/* مودال إضافة مستخدم */}
    {props.isCreateOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => props.setIsCreateOpen(false)}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10 overflow-y-auto max-h-[90vh]">
          <button
            onClick={() => props.setIsCreateOpen(false)}
            className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إضافة مستخدم جديد</h4>
          {props.formError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">خطأ في إضافة المستخدم</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{props.formError}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={props.handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الاسم *</label>
              <input
                name="name"
                value={props.newUser.name}
                onChange={props.handleCreateChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ادخل الاسم الكامل"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني *</label>
              <input
                type="email"
                name="email"
                value={props.newUser.email}
                onChange={props.handleCreateChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">كلمة المرور *</label>
              <input
                type="password"
                name="password"
                value={props.newUser.password}
                onChange={props.handleCreateChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={4}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">على الأقل 4 أحرف</p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
              <input
                name="phone"
                value={props.newUser.phone || ''}
                onChange={props.handleCreateChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="01234567890"
                required
                minLength={10}
                maxLength={15}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">من 10 إلى 15 رقم</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => props.setIsCreateOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={props.isSubmitting}
                className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {props.isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>جارٍ الإضافة...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>إضافة مستخدم</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    {/* مودال تغيير الدور */}
    {props.isRoleOpen && props.roleUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => props.setIsRoleOpen(false)}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تغيير دور المستخدم</h4>
          {props.roleError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">خطأ في تغيير الدور</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{props.roleError}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={props.handleRoleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الدور</label>
              <select
                name="role"
                value={props.roleForm}
                onChange={e => props.setRoleForm(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="member">عضو</option>
                <option value="trainer">مدرب</option>
                <option value="manager">مدير</option>
                <option value="admin">إدارة</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => props.setIsRoleOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">إلغاء</button>
              <button type="submit" disabled={props.isRoleSubmitting} className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors duration-200 flex items-center gap-2">
                {props.isRoleSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>حفظ التغيير</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    {/* مودال تعديل المستخدم */}
    {props.isEditOpen && props.editUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => props.setIsEditOpen(false)}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
        <button
          onClick={() => props.setIsEditOpen(false)}
          className="absolute top-3 left-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تعديل المستخدم</h4>
          {props.editError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">خطأ في تعديل المستخدم</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{props.editError}</p>
                </div>
              </div>
            </div>
          )}
          <form
            onSubmit={props.handleEditSubmit}
            className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* الاسم */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
              <input name="name" value={props.editForm.name} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
              <input type="email" name="email" value={props.editForm.email} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* الباركود */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">🏷️ الباركود</label>
              <input name="barcode" value={props.editForm.barcode} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* الدور */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الدور</label>
              <select name="role" value={props.editForm.role} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="member">عضو</option>
                <option value="trainer">مدرب</option>
                <option value="manager">مدير</option>
                <option value="admin">إدارة</option>
              </select>
            </div>
            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف</label>
              <input name="phone" value={props.editForm.phone} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* تاريخ الميلاد */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ الميلاد</label>
              <input type="date" name="dob" value={props.editForm.dob} onClick={(e) => e.currentTarget.showPicker?.()} onChange={props.handleEditChange} className=" cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* صورة المستخدم */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">صورة المستخدم</label>
              {/* واجهة رفع مخصصة */}
              <div
                className="cursor-pointer flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 transition"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                style={{ outline: 'none' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1119 17H7z" />
                </svg>
                {
                  avatarFile ? (
                    <span className="text-sm text-green-700 dark:text-green-400">{avatarFile.name}</span>
                  ) : (
                    <span className="text-xs text-gray-600 dark:text-gray-300">اضغط هنا أو قم بسحب صورة المستخدم للرفع</span>
                  )
                }
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    // المعاينة مباشرة على الجهاز
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setAvatarPreviewUrl(url);
                      setUploadSuccess(false); // يرجع نص الزر للوضع الافتراضي عند اختيار صورة جديدة
                    }
                  }}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  disabled={!avatarFile || isAvatarUploading}
                  onClick={async () => {
                    if (!props.editUser?._id || !avatarFile) return;
                    try {
                      setIsAvatarUploading(true);
                      const result: any = await userSvc.updateUser(props.editUser._id as any, { avatarFile } as any);
                      const updated = result?.user || result;
                      if (updated?.avatarUrl) {
                        setAvatarPreviewUrl(`${updated.avatarUrl}?ts=${Date.now()}`); // تأكيد التحديث الفوري للمعاينة
                        props.handleEditChange({ target: { name: 'avatarUrl', value: updated.avatarUrl } } as React.ChangeEvent<HTMLInputElement>);
                        setUploadSuccess(true); // يظل الزر على تم الرفع إلى أن يختار صورة جديدة
                      }
                      setAvatarFile(null);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsAvatarUploading(false);
                    }
                  }}
                  className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white flex items-center gap-2"
                >
                  {isAvatarUploading
                    ? 'جارٍ الرفع...'
                    : uploadSuccess
                    ? (<><span>تم الرفع</span><svg className="h-4 w-4 text-white inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>)
                    : 'رفع الصورة'}
                </button>
                {/* الصورة */}
                {(avatarPreviewUrl) && (
                  <img
                    src={avatarPreviewUrl}
                    alt="preview"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                  />
                )}
              </div>
            </div>
            {/* العنوان */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
              <input name="address" value={props.editForm.address} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* الرصيد */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الرصيد</label>
              <input type="number" name="balance" value={props.editForm.balance} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* الحالة */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
              <select name="status" value={props.editForm.status} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="banned">محظور</option>
              </select>
            </div>
            {/* بيانات الاشتراك والعضوية */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ بداية الاشتراك</label>
              <input type="date" name="subscriptionStartDate" onClick={(e) => e.currentTarget.showPicker?.()} value={props.editForm.subscriptionStartDate} onChange={props.handleEditChange} className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ نهاية الاشتراك</label>
              <input type="date" name="subscriptionEndDate" onClick={(e) => e.currentTarget.showPicker?.()} value={props.editForm.subscriptionEndDate} onChange={props.handleEditChange} className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">أيام تجميد الاشتراك</label>
              <input type="number" name="subscriptionFreezeDays" value={props.editForm.subscriptionFreezeDays} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">أيام التجميد المستخدمة</label>
              <input type="number" name="subscriptionFreezeUsed" value={props.editForm.subscriptionFreezeUsed} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">حالة الاشتراك</label>
              <select name="subscriptionStatus" value={props.editForm.subscriptionStatus} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="active">نشط</option>
                <option value="frozen">مجمد</option>
                <option value="expired">منتهي</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ إرسال تذكير التجديد</label>
              <input type="datetime-local" name="subscriptionRenewalReminderSent" onClick={(e) => e.currentTarget.showPicker?.()}  value={props.editForm.subscriptionRenewalReminderSent || ''} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ آخر دفع</label>
              <input type="date" name="lastPaymentDate" onClick={(e) => e.currentTarget.showPicker?.()} value={props.editForm.lastPaymentDate} onChange={props.handleEditChange} className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ استحقاق الدفع القادم</label>
              <input type="date" name="nextPaymentDueDate" onClick={(e) => e.currentTarget.showPicker?.()} value={props.editForm.nextPaymentDueDate} onChange={props.handleEditChange} className="cursor-pointer w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* النقاط والعضوية */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">نقاط الولاء</label>
              <input type="number" name="loyaltyPoints" value={props.editForm.loyaltyPoints} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">مستوى العضوية</label>
              <select name="membershipLevel" value={props.editForm.membershipLevel} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="basic">عادي</option>
                <option value="silver">فضي</option>
                <option value="gold">ذهبي</option>
                <option value="platinum">بلاتينيوم</option>
              </select>
            </div>

            {/* بيانات المستخدم */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الطول (سم)</label>
              <input name="heightCm" value={props.editForm.heightCm || ''} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="الطول بالسنتيمتر" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الوزن الابتدائي (كجم)</label>
              <input name="baselineWeightKg" value={props.editForm.baselineWeightKg || ''} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="الوزن الابتدائي" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الوزن المستهدف (كجم)</label>
              <input name="targetWeightKg" value={props.editForm.targetWeightKg || ''} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="الوزن المستهدف" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">مستوى النشاط</label>
              <select name="activityLevel" value={props.editForm.activityLevel || ''} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="">غير محدد</option>
                <option value="sedentary">قليل الحركة</option>
                <option value="light">نشاط خفيف</option>
                <option value="moderate">نشاط متوسط</option>
                <option value="active">نشاط عالٍ</option>
                <option value="very_active">نشاط شديد</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">ملاحظات صحية</label>
              <textarea name="healthNotes" value={props.editForm.healthNotes || ''} onChange={e => props.handleEditChange(e as any)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="أي ملاحظات صحية" />
            </div>
            {/* حالة الحذف */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">حالة الحذف</label>
              <select name="isDeleted" value={props.editForm.isDeleted} onChange={props.handleEditChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="false">غير محذوف</option>
                <option value="true">محذوف</option>
              </select>
            </div>
            {/* الأهداف */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الأهداف</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals.weightLoss"
                    checked={props.editForm.goals?.weightLoss || false}
                    onChange={props.handleEditChange}
                    className="mr-2"
                  />
                  فقدان الوزن
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals.muscleGain"
                    checked={props.editForm.goals?.muscleGain || false}
                    onChange={props.handleEditChange}
                    className="mr-2"
                  />
                  بناء العضلات
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals.endurance"
                    checked={props.editForm.goals?.endurance || false}
                    onChange={props.handleEditChange}
                    className="mr-2"
                  />
                  تحسين التحمل
                </label>
              </div>
            </div>
            {/* ملاحظات فقط */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
              <textarea name="metadata.notes" value={props.editForm.metadata?.notes || ''} onChange={(e) => props.handleEditChange(e as any)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            {/* مدرب المستخدم */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">معرف المدرب</label>
              <select
                name="trainerId"
                value={props.editForm.trainerId || ''}
                onChange={props.handleEditChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">بدون مدرب</option>
                {loadingTrainers ? (
                  <option value="" disabled>جارٍ التحميل...</option>
                ) : (
                  trainers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} {t.phone ? `(${t.phone})` : ''}</option>
                  ))
                )}
              </select>
            </div>
            {/* createdAt, updatedAt */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ الإنشاء</label>
              <input name="createdAt" value={formatDateTime(props.editForm.createdAt)} readOnly className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">تاريخ التعديل</label>
              <input name="updatedAt" value={formatDateTime(props.editForm.updatedAt)} readOnly className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => props.setIsEditOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">إلغاء</button>
              <button type="submit" disabled={props.isEditSubmitting} className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors duration-200 flex items-center gap-2">
                {props.isEditSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    {/* مودال تأكيد الحذف */}
    {props.isDeleteOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => props.setIsDeleteOpen(false)}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 z-10">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            {props.deleteType === 'soft' ? 'تأكيد حذف المستخدم' : 'تأكيد الحذف النهائي للمستخدم'}
          </h4>
          <div className="mb-6 text-center text-gray-700 dark:text-gray-300">
            {props.deleteType === 'soft'
              ? 'هل أنت متأكد أنك تريد حذف هذا المستخدم؟ يمكن استرجاعه لاحقًا.'
              : 'هل أنت متأكد أنك تريد حذف هذا المستخدم نهائيًا؟ لا يمكن استرجاعه بعد ذلك!'}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => props.setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              إلغاء
            </button>
            <button
              onClick={props.confirmDelete}
              className={`px-4 py-2 rounded-md text-white ${props.deleteType === 'soft' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-800 hover:bg-red-900 font-bold'}`}
            >
              {props.deleteType === 'soft' ? 'تأكيد الحذف' : 'تأكيد الحذف النهائي'}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* مودال عرض بيانات المستخدم */}
    {props.isViewOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => props.setIsViewOpen(false)}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
          {/* رأس المودال: صورة المستخدم وزر X */}
          <div className="relative flex flex-col items-center mb-6 mt-2">
            <button
              onClick={() => props.setIsViewOpen(false)}
              className="absolute top-2 left-2 md:left-auto md:right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
              aria-label="إغلاق"
            >
              ×
            </button>
            {props.viewUser?.avatarUrl && props.viewUser.avatarUrl !== '' ? (
              <img
                src={props.viewUser.avatarUrl}
                alt={props.viewUser.name || 'User'}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow mb-2"
              />
            ) : (
              <img
                src="https://img.freepik.com/premium-vector/sports-dumbbell-gymnastics-sketch-isolated_522698-33.jpg"
                alt="User"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow mb-2"
              />
            )}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">👤 بيانات المستخدم</h4>
          {props.viewLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : props.viewUser && !props.viewUser.error ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* User IDs */}
              {/* <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🆔 معرّف المستخدم (ID)</span>
                <span className="text-gray-900 dark:text-white break-all">{props.viewUser._id}</span>
              </div> */}
              {props.viewUser.barcode && (
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🏷️ الباركود</span>
                  <span className="text-gray-900 dark:text-white break-all">{props.viewUser.barcode}</span>
                </div>
              )}

              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">👤 الاسم</span>
                <span className="text-gray-900 dark:text-white break-all">{props.viewUser.name}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">✉️ البريد الإلكتروني</span>
                <span className="text-gray-900 dark:text-white break-all">{props.viewUser.email}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🏷️ الدور</span>
                <span className="text-gray-900 dark:text-white">{
                  props.viewUser.role === 'admin' ? 'إدارة' :
                  props.viewUser.role === 'manager' ? 'مدير' :
                  props.viewUser.role === 'trainer' ? 'مدرب' :
                  'عضو'
                }</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">📞 رقم الهاتف</span>
                <span className="text-gray-900 dark:text-white">{props.viewUser.phone || '-'}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">💰 الرصيد</span>
                <span className="text-gray-900 dark:text-white">{props.viewUser.balance ?? 0}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🔖 الحالة</span>
                <span className="text-gray-900 dark:text-white">{
                  props.viewUser.status === 'active' ? 'نشط' :
                  props.viewUser.status === 'inactive' ? 'غير نشط' :
                  props.viewUser.status === 'banned' ? 'محظور' : '-'
                }</span>
              </div>

              {props.viewUser.emailVerificationToken && (
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">✅ توكن تأكيد البريد</span>
                  <span className="text-gray-900 dark:text-white break-all">{props.viewUser.emailVerificationToken}</span>
                </div>
              )}
              {typeof props.viewUser.failedLoginAttempts === 'number' && (
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🚫 محاولات الدخول الفاشلة</span>
                  <span className="text-gray-900 dark:text-white">{props.viewUser.failedLoginAttempts}</span>
                </div>
              )}
              {props.viewUser.lockUntil && (
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🔒 تاريخ القفل</span>
                  <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.lockUntil)}</span>
                </div>
              )}
              {typeof props.viewUser.isDeleted === 'boolean' && (
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🗑️ محذوف؟</span>
                  <span className="text-gray-900 dark:text-white">{props.viewUser.isDeleted ? '✔️' : '❌'}</span>
                </div>
              )}
              {/* العضوية */}
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🏆 مستوى العضوية</span>
                <span className="text-gray-900 dark:text-white">{
                  props.viewUser.membershipLevel === 'basic' ? 'عادي' :
                  props.viewUser.membershipLevel === 'silver' ? 'فضي' :
                  props.viewUser.membershipLevel === 'gold' ? 'ذهبي' :
                  props.viewUser.membershipLevel === 'platinum' ? 'بلاتينيوم' : '-'
                }</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">⭐ نقاط الولاء</span>
                <span className="text-gray-900 dark:text-white">{props.viewUser.loyaltyPoints ?? 0}</span>
              </div>
              {/* الأهداف */}
              <div className="flex flex-col border-b pb-2 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🎯 الأهداف</span>
                <div className="flex gap-6 flex-wrap">
                  <span className="flex items-center gap-1">
                    {props.viewUser.goals?.weightLoss ? '✔️' : '❌'} فقدان الوزن
                  </span>
                  <span className="flex items-center gap-1">
                    {props.viewUser.goals?.muscleGain ? '✔️' : '❌'} بناء العضلات
                  </span>
                  <span className="flex items-center gap-1">
                    {props.viewUser.goals?.endurance ? '✔️' : '❌'} تحسين التحمل
                  </span>
                </div>
              </div>
              {/* بيانات الاشتراك */}
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">📅 تاريخ بداية الاشتراك</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.subscriptionStartDate)}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">📅 تاريخ نهاية الاشتراك</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.subscriptionEndDate)}</span>
              </div>
              {props.viewUser.subscriptionRenewalReminderSent && (
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🔔 تذكير التجديد</span>
                  <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.subscriptionRenewalReminderSent)}</span>
                </div>
              )}
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">💳 تاريخ آخر دفع</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.lastPaymentDate)}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">📆 تاريخ استحقاق الدفع القادم</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.nextPaymentDueDate)}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🧑‍🏫 اسم المدرب</span>
                <span className="text-gray-900 dark:text-white break-all">
                  {(() => {
                    const raw = props.viewUser?.trainerId;
                    if (!raw) return '-';

                    // In case backend "populated" trainerId with name-like fields.
                    if (typeof raw === 'object' && raw !== null) {
                      const directName =
                        raw.name ?? raw.fullName ?? raw.trainerName ?? raw.username ?? null;
                      if (directName) return directName;
                      const id = raw._id ?? raw.id ?? null;
                      if (!id) return '-';
                      const found = trainers.find((t) => normalizeId(t._id) === normalizeId(id));
                      return found?.name ?? resolvedTrainerName ?? id;
                    }

                    // If trainerId is just an id.
                    if (typeof raw === 'string') {
                      const found = trainers.find((t) => normalizeId(t._id) === normalizeId(raw));
                      return found?.name ?? resolvedTrainerName ?? raw;
                    }

                    return '-';
                  })()}
                </span>
              </div>
              {/* بيانات المستخدم - تظهر فقط إن وجدت */}
              {(props.viewUser.heightCm !== undefined || props.viewUser.baselineWeightKg !== undefined || props.viewUser.targetWeightKg !== undefined || props.viewUser.activityLevel || props.viewUser.healthNotes || props.viewUser.metadata?.heightCm !== undefined) && (
                <div className="flex flex-col border-b pb-2 col-span-1 md:col-span-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-2">🗂️ بيانات المستخدم</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {(() => {
                      const height = props.viewUser.heightCm ?? props.viewUser.metadata?.heightCm;
                      return (height !== undefined && height !== null && height !== '') ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">📏 الطول (سم)</span>
                          <span className="text-gray-900 dark:text-white">{height}</span>
                        </div>
                      ) : null;
                    })()}
                    {(props.viewUser.baselineWeightKg !== undefined && props.viewUser.baselineWeightKg !== null && props.viewUser.baselineWeightKg !== '') && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">⚖️ الوزن الابتدائي (كجم)</span>
                        <span className="text-gray-900 dark:text-white">{props.viewUser.baselineWeightKg}</span>
                      </div>
                    )}
                    {(props.viewUser.targetWeightKg !== undefined && props.viewUser.targetWeightKg !== null && props.viewUser.targetWeightKg !== '') && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">🎯 الوزن المستهدف (كجم)</span>
                        <span className="text-gray-900 dark:text-white">{props.viewUser.targetWeightKg}</span>
                      </div>
                    )}
                    {props.viewUser.activityLevel && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">⚡ مستوى النشاط</span>
                        <span className="text-gray-900 dark:text-white">
                          {props.viewUser.activityLevel === 'sedentary' ? 'قليل الحركة' :
                           props.viewUser.activityLevel === 'light' ? 'نشاط خفيف' :
                           props.viewUser.activityLevel === 'moderate' ? 'نشاط متوسط' :
                           props.viewUser.activityLevel === 'active' ? 'نشاط عالٍ' :
                           props.viewUser.activityLevel === 'very_active' ? 'نشاط شديد' : props.viewUser.activityLevel}
                        </span>
                      </div>
                    )}
                    {props.viewUser.healthNotes && (
                      <div className="md:col-span-2 flex items-start justify-between">
                        <span className="text-gray-600 dark:text-gray-400">📝 ملاحظات صحية</span>
                        <span className="text-gray-900 dark:text-white ml-2">{props.viewUser.healthNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* metadata */}
              {(props.viewUser.metadata && (props.viewUser.metadata.emergencyContact || props.viewUser.metadata.notes || props.viewUser.metadata.lastLogin || props.viewUser.metadata.ipAddress)) && (
                <div className="flex flex-col border-b pb-2 col-span-1 md:col-span-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 mb-2">📎 بيانات إضافية</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {props.viewUser.metadata.emergencyContact && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">🚑 رقم طوارئ</span>
                        <span className="text-gray-900 dark:text-white">{props.viewUser.metadata.emergencyContact}</span>
                      </div>
                    )}
                    {props.viewUser.metadata.notes && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">📝 ملاحظات</span>
                        <span className="text-gray-900 dark:text-white">{props.viewUser.metadata.notes}</span>
                      </div>
                    )}
                    {props.viewUser.metadata.lastLogin && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">🕓 آخر دخول</span>
                        <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.metadata.lastLogin)}</span>
                      </div>
                    )}
                    {props.viewUser.metadata.ipAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">🌐 IP Address</span>
                        <span className="text-gray-900 dark:text-white">{props.viewUser.metadata.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* createdAt, updatedAt */}
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🗓️ تاريخ الإنشاء</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.createdAt)}</span>
              </div>
              <div className="flex flex-col border-b pb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-1">🗓️ تاريخ التعديل</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(props.viewUser.updatedAt)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-600 py-8">{props.viewUser?.error || 'تعذر جلب البيانات'}</div>
          )}
          <div className="flex items-center justify-center gap-3 pt-6">
            <button onClick={() => props.setIsViewOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">إغلاق</button>
          </div>
        </div>
      </div>
    )}
  </>;
};

export default AdminUserModals;
