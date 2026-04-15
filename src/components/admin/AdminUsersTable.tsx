'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { UserService } from '@/services/userService';
import { usePermissions } from '@/hooks/usePermissions';
import type { User as UserModel } from '@/types/models';
import AdminUsersTableHeader from './AdminUsersTableHeader';
import AdminUsersTableList from './AdminUsersTableList';
import AdminUsersTablePagination from './AdminUsersTablePagination';
import AdminUserModals from './AdminUserModals';
import { getSubscriptionAlertService } from '@/services/subscriptionAlertService';
import * as XLSX from 'xlsx';
import VideoTutorial from '../VideoTutorial';

const AdminUsersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ 
    name: '', email: '', password: '', role: 'member', phone: '', dob: '', avatarUrl: '', address: '', 
    balance: 0, status: 'active', isEmailVerified: false, loyaltyPoints: 0, membershipLevel: 'basic', 
    goals: { weightLoss: false, muscleGain: false, endurance: false }, trainerId: '',
    subscriptionStartDate: '', subscriptionEndDate: '', lastPaymentDate: '', nextPaymentDueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const userService = useMemo(() => new UserService(), []);
  const { hasPermission, user: currentUser } = usePermissions();
  const PAGE_SIZE = 10;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserModel | null>(null);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    email: '',
    role: 'member',
    phone: '',
    dob: '',
    avatarUrl: '',
    address: '',
    balance: 0,
    status: 'active',
    isEmailVerified: false,
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    subscriptionFreezeDays: 0,
    subscriptionFreezeUsed: 0,
    subscriptionStatus: 'active',
    lastPaymentDate: '',
    nextPaymentDueDate: '',
    loyaltyPoints: 0,
    membershipLevel: 'basic',
    goals: { weightLoss: false, muscleGain: false, endurance: false },
    trainerId: '',
    // NEW: gym fields defaults
    heightCm: '',
    baselineWeightKg: '',
    targetWeightKg: '',
    activityLevel: '',
    healthNotes: '',
    createdAt: '',
    updatedAt: '',
    barcode: '',
    subscriptionRenewalReminderSent: '',
    metadata: {
      notes: '',
      emergencyContact: ''
    }
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<UserModel | null>(null);
  const [roleForm, setRoleForm] = useState('member');
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [hasPlayedAlert, setHasPlayedAlert] = useState(false);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const latestFetchRef = useRef(0);

  useEffect(() => {
    const fetchUsersPage = async () => {
      setLoading(true);
      setListError(null);
      const fetchId = Date.now();
      latestFetchRef.current = fetchId;
      try {
        const params = { page: currentPage, limit: PAGE_SIZE } as any;
        const res =
          filterRole && filterRole !== 'all'
            ? await userService.getUsersByRole(filterRole, params)
            : await userService.getUsers(params);

        const usersArr: UserModel[] = (res as any)?.data || [];
        const pagination = (res as any)?.pagination || {};
        const total = Number(pagination.total ?? 0);
        const tPages = Number(pagination.totalPages ?? 1);

        // Prevent stale/double effect runs from overwriting state
        if (latestFetchRef.current === fetchId) {
          setUsers(usersArr);
          setTotalUsers(total);
          setTotalPages(tPages || 1);
        }
      } catch (err) {
        if (latestFetchRef.current === fetchId) {
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(1);
        }
        const message =
          err instanceof Error ? err.message : 'تعذر جلب المستخدمين. تحقق من تسجيل الدخول والصلاحيات.';
        setListError(message);
      } finally {
        if (latestFetchRef.current === fetchId) {
          setLoading(false);
        }
      }
    };
    fetchUsersPage();
  }, [refresh, userService, currentPage, filterRole]);

  useEffect(() => {
    // Run subscription alerts check once after users are available
    if (hasPlayedAlert) return;
    if (users.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const alerts = await getSubscriptionAlertService().getSubscriptionAlerts();
        const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
        if (!cancelled && criticalAlerts.length > 0) {
          setHasPlayedAlert(true);
        }
      } catch {
        // ignore alert errors; shouldn't block users list
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [users.length, hasPlayedAlert]);

  // Search is applied locally to current page only (server-side search can be added later)
  const visibleUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, searchTerm]);

  const getRoleText = (role: string) => {
    const roles = { member: 'عضو', trainer: 'مدرب', admin: 'إدارة', manager: 'مدير' };
    return roles[role as keyof typeof roles] || role;
  };
  const getRoleColor = (role: string) => {
    const colors = { member: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', trainer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', manager: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  const getStatusColor = (status: string) => {
    const colors = { active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', banned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  const getSubscriptionColor = (subscription: string) => {
    const colors = { active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    return colors[subscription as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  const safeUsers = Array.isArray(visibleUsers) ? visibleUsers : [];

  // handlers (نفس الكود السابق)
  const openCreate = () => {
    setFormError(null);
    setNewUser({ 
      name: '', email: '', password: '', role: 'member', phone: '', dob: '', avatarUrl: '', address: '', 
      balance: 0, status: 'active', isEmailVerified: false, loyaltyPoints: 0, membershipLevel: 'basic', 
      goals: { weightLoss: false, muscleGain: false, endurance: false }, trainerId: '',
      subscriptionStartDate: '', subscriptionEndDate: '', lastPaymentDate: '', nextPaymentDueDate: ''
    });
    setIsCreateOpen(true);
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // التعامل مع الحقول المتداخلة مثل goals.weightLoss
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setNewUser(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof typeof prev] as any || {}),
            [childKey]: checked
          }
        }));
      } else {
        setNewUser(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      // التعامل مع الحقول المتداخلة مثل metadata.lastLogin
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setNewUser(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof typeof prev] as any || {}),
            [childKey]: value
          }
        }));
      } else {
    setNewUser(prev => ({ ...prev, [name]: value }));
      }
    }
    
    if (formError) setFormError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setFormError('الرجاء ملء جميع الحقول');
      return;
    }
    setIsSubmitting(true);
    try {
      // تحويل القيم الرقمية والتواريخ
      const userData: any = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as any,
        phone: newUser.phone || null,
        dob: newUser.dob || null,
        avatarUrl: newUser.avatarUrl || null,
        address: newUser.address || null,
        balance: Number(newUser.balance) || 0,
        status: newUser.status as any,
        isEmailVerified: Boolean(newUser.isEmailVerified),
        loyaltyPoints: Number(newUser.loyaltyPoints) || 0,
        membershipLevel: newUser.membershipLevel as any,
        goals: newUser.goals || { weightLoss: false, muscleGain: false, endurance: false },
        trainerId: newUser.trainerId || null,
        subscriptionStartDate: newUser.subscriptionStartDate || null,
        subscriptionEndDate: newUser.subscriptionEndDate || null,
        lastPaymentDate: newUser.lastPaymentDate || null,
        nextPaymentDueDate: newUser.nextPaymentDueDate || null,
      };
      
      // حذف الحقول الفارغة
      Object.keys(userData).forEach(key => {
        if (userData[key] === null || userData[key] === undefined || userData[key] === '') {
          delete userData[key];
        }
      });
      
      await userService.createUser(userData);
      setIsCreateOpen(false);
      setRefresh(r => !r); // Refresh to show new user
    } catch (err: any) {
      // استخراج الرسالة الدقيقة من API إذا وجدت
      let errorMessage = 'حدث خطأ أثناء إنشاء المستخدم';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // فتح popup تغيير الدور
  const handleChangeRole = (id: string, currentRole: string) => {
    const user = users.find(u => u._id === id);
    if (!user) return;
    setRoleUser(user);
    setRoleForm(user.role);
    setRoleError(null);
    setIsRoleOpen(true);
  };

  // حفظ تغيير الدور
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm) {
      setRoleError('يرجى اختيار الدور');
      return;
    }
    setIsRoleSubmitting(true);
    try {
      await userService.updateRole(roleUser!._id, roleForm as any);
      setIsRoleOpen(false);
      setRefresh(r => !r);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم تغيير الدور بنجاح' } }));
    } catch (err: any) {
      // استخراج الرسالة الدقيقة من API إذا وجدت
      let errorMessage = 'حدث خطأ أثناء تغيير الدور';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setRoleError(errorMessage);
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  // تحديث handleEdit ليشمل كل بيانات المستخدم
  const handleEdit = (id: string) => {
    const user = users.find(u => u._id === id);
    if (!user) return;
    function dateToInputString(val: any): string {
      if (!val) return '';
      if (typeof val === 'string') {
        // إذا string من نوع ISO
        if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
        // إذا string تاريخ عربي أو غيره
        return '';
      }
      if (val instanceof Date) return val.toISOString().substring(0, 10);
      return '';
    }
    
    function datetimeToInputString(val: any): string {
      if (!val) return '';
      if (typeof val === 'string') {
        // إذا string من نوع ISO
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) return val.substring(0, 16);
        // إذا string تاريخ عربي أو غيره
        return '';
      }
      if (val instanceof Date) return val.toISOString().substring(0, 16);
      return '';
    }
    setEditUser(user);
    setEditForm({
      _id: user._id || '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'member',
      phone: user.phone || '',
      dob: dateToInputString(user.dob),
      avatarUrl: user.avatarUrl || '',
      address: user.address || '',
      balance: user.balance ?? 0,
      status: user.status || 'active',
      isEmailVerified: user.isEmailVerified ?? false,
      subscriptionStartDate: dateToInputString(user.subscriptionStartDate),
      subscriptionEndDate: dateToInputString(user.subscriptionEndDate),
      subscriptionFreezeDays: user.subscriptionFreezeDays ?? 0,
      subscriptionFreezeUsed: user.subscriptionFreezeUsed ?? 0,
      subscriptionStatus: user.subscriptionStatus || 'active',
      lastPaymentDate: dateToInputString(user.lastPaymentDate),
      nextPaymentDueDate: dateToInputString(user.nextPaymentDueDate),
      loyaltyPoints: user.loyaltyPoints ?? 0,
      membershipLevel: user.membershipLevel || 'basic',
      goals: user.goals || { weightLoss: false, muscleGain: false, endurance: false },
      trainerId: user.trainerId || '',
      // NEW gym fields
      heightCm: (user as any).heightCm ?? '',
      baselineWeightKg: (user as any).baselineWeightKg ?? '',
      targetWeightKg: (user as any).targetWeightKg ?? '',
      activityLevel: (user as any).activityLevel ?? '',
      healthNotes: (user as any).healthNotes ?? '',
      createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toLocaleString('ar-EG') : user.createdAt) : '',
      updatedAt: user.updatedAt ? (user.updatedAt instanceof Date ? user.updatedAt.toLocaleString('ar-EG') : user.updatedAt) : '',
      barcode: (user as any).barcode ?? '',
      subscriptionRenewalReminderSent: datetimeToInputString((user as any).subscriptionRenewalReminderSent),
      metadata: {
        notes: (user as any).metadata?.notes || '',
        emergencyContact: (user as any).metadata?.emergencyContact || ''
      }

    });
    setEditError(null);
    setIsEditOpen(true);
  };

  // تحديث handleEditChange ليشمل كل الحقول
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
        
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // التعامل مع الحقول المتداخلة مثل goals.weightLoss
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setEditForm(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof typeof prev] as any || {}),
            [childKey]: checked
          }
        }));
      } else {
        setEditForm(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      // التعامل مع الحقول المتداخلة مثل metadata.lastLogin
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setEditForm(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof typeof prev] as any || {}),
            [childKey]: value
          }
        }));
      } else {
    setEditForm(prev => ({ ...prev, [name]: value }));
      }
    }
    
    if (editError) setEditError(null);
  };

const handleEditSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editForm.name || !editForm.email) {
    setEditError('الرجاء ملء جميع الحقول الأساسية');
    return;
  }
  setIsEditSubmitting(true);
  try {
    const { _id, createdAt, updatedAt, ...toSend } = editForm;

    // الحقول الرقمية
    const numericFields = ['balance','subscriptionFreezeDays','subscriptionFreezeUsed',
      'loyaltyPoints','heightCm','baselineWeightKg','targetWeightKg'];
    numericFields.forEach(field => {
      const val = (toSend as any)[field];
      if (val !== '' && val !== null && val !== undefined) {
        const n = Number(val);
        (toSend as any)[field] = isNaN(n) ? 0 : n;
      } else {
        (toSend as any)[field] = 0;
      }
    });

    // Boolean
    toSend.isEmailVerified = Boolean(toSend.isEmailVerified);
    if (toSend.goals) {
      toSend.goals.weightLoss = Boolean(toSend.goals.weightLoss);
      toSend.goals.muscleGain = Boolean(toSend.goals.muscleGain);
      toSend.goals.endurance = Boolean(toSend.goals.endurance);
    }

    // phone و trainerId => null لو فارغين
    ['phone', 'trainerId'].forEach(field => {
      if (!(toSend as any)[field]) (toSend as any)[field] = null;
    });

    // barcode => omit if empty (unique field)
    if (!(toSend as any)['barcode']) delete (toSend as any)['barcode'];

    // address و avatarUrl و healthNotes => "" لو فارغين
    ['address', 'avatarUrl', 'healthNotes'].forEach(field => {
      if ((toSend as any)[field] === null || (toSend as any)[field] === undefined) {
        (toSend as any)[field] = '';
      }
    });

    // activityLevel => omit if empty (enum)
    if (!(toSend as any)['activityLevel']) delete (toSend as any)['activityLevel'];

    // حقول التاريخ
    const dateKeys = ['dob','subscriptionStartDate','subscriptionEndDate',
      'lastPaymentDate','nextPaymentDueDate','subscriptionRenewalReminderSent'] as const;
    dateKeys.forEach(key => {
      const val = (toSend as any)[key];
      if (val && val !== '') {
        (toSend as any)[key] = new Date(val).toISOString();
      } else {
        delete (toSend as any)[key]; // Don't send empty date fields
      }
    });

    // الحقول المسموحة فقط
const allowedKeys = [
  'name','email','role','phone','avatarUrl','address','balance','status','isEmailVerified',
  'subscriptionStartDate','subscriptionEndDate','subscriptionFreezeDays','subscriptionFreezeUsed',
  'subscriptionStatus','lastPaymentDate','nextPaymentDueDate','loyaltyPoints','membershipLevel',
  'goals','trainerId','heightCm','baselineWeightKg','targetWeightKg','activityLevel',
  'healthNotes','barcode','dob','subscriptionRenewalReminderSent',
  'metadata.emergencyContact',
  'metadata.notes'
];

    const filteredData: any = {};
    for (const key of allowedKeys) {
      if (key.includes('.')) {
        // Handle nested fields like metadata.notes
        const [parentKey, childKey] = key.split('.');
        if ((toSend as any)[parentKey] && (toSend as any)[parentKey][childKey] !== undefined) {
          filteredData[key] = (toSend as any)[parentKey][childKey];
        }
      } else if (key in (toSend as any)) {
        // Handle regular fields
        filteredData[key] = (toSend as any)[key];
      }
    }
    await userService.updateUser(editUser!._id, filteredData);
    setIsEditOpen(false);
    setRefresh(r => !r);
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { type: 'success', message: 'تم تعديل المستخدم بنجاح' } 
    }));
  } catch (err: any) {
    console.error('Error updating user:', err);
    let errorMessage = 'حدث خطأ أثناء التعديل';
    if (err?.response?.data?.message) errorMessage = err.response.data.message;
    else if (err?.message?.includes('E11000 duplicate key error')) {
      errorMessage = 'الباركود مستخدم بالفعل. يرجى إدخال باركود فريد.';
    } else if (err?.message) errorMessage = err.message;
    setEditError(errorMessage);
  } finally {
    setIsEditSubmitting(false);
  }
};
  // تحديث الحذف ليظهر notification عصري (مؤقتاً استخدم window.confirm وwindow.dispatchEvent)
  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف المستخدم؟')) return;
    setLoading(true);
    try {
      await userService.deleteUser(id);
      setRefresh(r => !r);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم حذف المستخدم بنجاح' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'حدث خطأ أثناء الحذف' } }));
    } finally {
      setLoading(false);
    }
  };
  const handleHardDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف المستخدم نهائياً؟')) return;
    setLoading(true);
    try {
      await userService.hardDeleteUser(id);
      setRefresh(r => !r);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم حذف المستخدم نهائياً' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'حدث خطأ أثناء الحذف النهائي' } }));
    } finally {
      setLoading(false);
    }
  };

  // فتح مودال الحذف
  const openDeleteModal = (id: string, type: 'soft' | 'hard') => {
    setDeleteUserId(id);
    setDeleteType(type);
    setIsDeleteOpen(true);
  };
  // تنفيذ الحذف بعد التأكيد
  const confirmDelete = async () => {
    if (!deleteUserId) return;
    setIsDeleteOpen(false);
    if (deleteType === 'soft') {
      await handleDelete(deleteUserId);
    } else {
      await handleHardDelete(deleteUserId);
    }
    setDeleteUserId(null);
  };

  // جلب بيانات المستخدم بالتفصيل
  const openViewUser = async (id: string) => {
    setIsViewOpen(true);
    setViewUser(null);
    setViewLoading(true);
    try {
      const user = await userService.getUser(id);
      setViewUser(user);
    } catch {
      setViewUser({ error: 'تعذر جلب بيانات المستخدم' });
    } finally {
      setViewLoading(false);
    }
  };

  // دالة تصدير البيانات إلى Excel
  const exportToExcel = () => {
    try {
      // تحضير البيانات للتصدير
      const exportData = users.map(user => ({
        'الاسم': user.name || '',
        'البريد الإلكتروني': user.email || '',
        'الدور': getRoleText(user.role),
        'رقم الهاتف': user.phone || '',
        'تاريخ الميلاد': user.dob ? new Date(user.dob).toLocaleDateString('ar-EG') : '',
        'العنوان': user.address || '',
        'الرصيد': user.balance || 0,
        'الحالة': user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'محظور',
        'تم التحقق من البريد': user.isEmailVerified ? 'نعم' : 'لا',
        'تاريخ بداية الاشتراك': user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString('ar-EG') : '',
        'تاريخ نهاية الاشتراك': user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ar-EG') : '',
        'حالة الاشتراك': user.subscriptionStatus === 'active' ? 'نشط' : user.subscriptionStatus === 'expired' ? 'منتهي' : 'ملغي',
        'تاريخ آخر دفع': user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString('ar-EG') : '',
        'تاريخ استحقاق الدفع القادم': user.nextPaymentDueDate ? new Date(user.nextPaymentDueDate).toLocaleDateString('ar-EG') : '',
        'نقاط الولاء': user.loyaltyPoints || 0,
        'مستوى العضوية': user.membershipLevel || '',
        'الأهداف': user.goals ? Object.entries(user.goals).filter(([_, value]) => value).map(([key, _]) => {
          const goalNames = { weightLoss: 'فقدان الوزن', muscleGain: 'بناء العضلات', endurance: 'تحسين التحمل' };
          return goalNames[key as keyof typeof goalNames] || key;
        }).join(', ') : '',
        'معرف المدرب': user.trainerId || '',
        'تاريخ الإنشاء': user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '',
        'آخر تعديل': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('ar-EG') : '',
      }));

      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // إنشاء كتاب عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'بيانات المستخدمين');

      // تحديد عرض الأعمدة
      const columnWidths = [
        { wch: 20 }, // الاسم
        { wch: 30 }, // البريد الإلكتروني
        { wch: 15 }, // الدور
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // تاريخ الميلاد
        { wch: 30 }, // العنوان
        { wch: 10 }, // الرصيد
        { wch: 10 }, // الحالة
        { wch: 15 }, // تم التحقق من البريد
        { wch: 20 }, // تاريخ بداية الاشتراك
        { wch: 20 }, // تاريخ نهاية الاشتراك
        { wch: 15 }, // حالة الاشتراك
        { wch: 20 }, // تاريخ آخر دفع
        { wch: 25 }, // تاريخ استحقاق الدفع القادم
        { wch: 15 }, // نقاط الولاء
        { wch: 15 }, // مستوى العضوية
        { wch: 30 }, // الأهداف
        { wch: 15 }, // معرف المدرب
        { wch: 15 }, // تاريخ الإنشاء
        { wch: 15 }, // آخر تعديل
      ];
      worksheet['!cols'] = columnWidths;

      // تصدير الملف
      const fileName = `بيانات_المستخدمين_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // إظهار رسالة نجاح
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { 
          type: 'success', 
          message: `تم تصدير ${exportData.length} مستخدم (صفحة حالية) بنجاح` 
        } 
      }));
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { 
          type: 'error', 
          message: 'حدث خطأ أثناء تصدير البيانات' 
        } 
      }));
    }
  };

  // userViewFields (جميع الحقول من User Schema)
  const userViewFields: { key: string; label: string; type?: 'object' }[] = [
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'role', label: 'الدور' },
    { key: 'phone', label: 'رقم الهاتف' },
    { key: 'dob', label: 'تاريخ الميلاد' },
    { key: 'avatarUrl', label: 'رابط الصورة' },
    { key: 'address', label: 'العنوان' },
    { key: 'balance', label: 'الرصيد' },
    { key: 'status', label: 'الحالة' },
    { key: 'isEmailVerified', label: 'تم التحقق من البريد' },
    { key: 'emailVerificationToken', label: 'رمز تأكيد البريد الإلكتروني' },
    { key: 'failedLoginAttempts', label: 'محاولات الدخول الفاشلة' },
    { key: 'lockUntil', label: 'تاريخ القفل' },
    { key: 'isDeleted', label: 'محذوف؟' },
    { key: 'subscriptionStartDate', label: 'تاريخ بداية الاشتراك' },
    { key: 'subscriptionEndDate', label: 'تاريخ نهاية الاشتراك' },
    { key: 'subscriptionFreezeDays', label: 'أيام تجميد الاشتراك' },
    { key: 'subscriptionFreezeUsed', label: 'أيام التجميد المستخدمة' },
    { key: 'subscriptionStatus', label: 'حالة الاشتراك' },
    { key: 'subscriptionRenewalReminderSent', label: 'تاريخ إرسال تذكير التجديد' },
    { key: 'lastPaymentDate', label: 'تاريخ آخر دفع' },
    { key: 'nextPaymentDueDate', label: 'تاريخ استحقاق الدفع القادم' },
    { key: 'loyaltyPoints', label: 'نقاط الولاء' },
    { key: 'membershipLevel', label: 'مستوى العضوية' },
    { key: 'goals', label: 'الأهداف', type: 'object' },
    { key: 'trainerId', label: 'معرف المدرب' },
    { key: 'metadata', label: 'بيانات إضافية', type: 'object' },
    { key: 'createdAt', label: 'تاريخ الإنشاء' },
    { key: 'updatedAt', label: 'آخر تعديل' },
    { key: 'barcode', label: 'باركود العضوية' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <VideoTutorial 
        videoId="WHeSQMRiUjU" 
        title="إدارة المستخدمين في سيستم الجيم – إنشاء وتعديل وحذف+ تعيين باركود  للمستخدم وتنبيهات انتهاء الاشتراك"
        position="bottom-right"
        buttonText="شرح"
      />
      <AdminUsersTableHeader
        searchTerm={searchTerm}
        setSearchTerm={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        filterRole={filterRole}
        setFilterRole={(v) => {
          setFilterRole(v);
          setCurrentPage(1);
        }}
        onOpenCreate={openCreate}
        onExportData={exportToExcel}
      />
      <AdminUsersTableList
        users={safeUsers}
        loading={loading}
        error={listError}
        openViewUser={openViewUser}
        canEdit={hasPermission('users:write')}
        canChangeRole={hasPermission('users:write')}
        canDelete={hasPermission('users:delete')}
        canHardDelete={currentUser?.role === 'admin' || currentUser?.role === 'manager'}
        handleEdit={handleEdit}
        handleChangeRole={handleChangeRole}
        openDeleteModal={openDeleteModal}
        getRoleText={getRoleText}
        getRoleColor={getRoleColor}
        getStatusColor={getStatusColor}
        getSubscriptionColor={getSubscriptionColor}
      />
      <AdminUsersTablePagination
        currentPage={currentPage}
        setCurrentPage={(p) => {
          const next = Math.max(1, Math.min(totalPages || 1, p));
          setCurrentPage(next);
        }}
        PAGE_SIZE={PAGE_SIZE}
        totalUsers={totalUsers}
        loading={loading}
      />
      <AdminUserModals
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        isSubmitting={isSubmitting}
        formError={formError}
        newUser={newUser}
        handleCreateChange={handleCreateChange}
        handleCreateSubmit={handleCreateSubmit}
        isRoleOpen={isRoleOpen}
        roleUser={roleUser}
        roleForm={roleForm}
        setRoleForm={setRoleForm}
        roleError={roleError}
        isRoleSubmitting={isRoleSubmitting}
        setIsRoleOpen={setIsRoleOpen}
        handleRoleSubmit={handleRoleSubmit}
        isEditOpen={isEditOpen}
        editUser={editUser}
        editForm={editForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        isEditSubmitting={isEditSubmitting}
        editError={editError}
        setIsEditOpen={setIsEditOpen}
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        deleteType={deleteType}
        confirmDelete={confirmDelete}
        isViewOpen={isViewOpen}
        setIsViewOpen={setIsViewOpen}
        viewUser={viewUser}
        viewLoading={viewLoading}
        userViewFields={userViewFields}
              />
            </div>
  );
};

export default AdminUsersTable;
