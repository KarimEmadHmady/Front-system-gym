'use client';

import { useState, useRef } from 'react';
import { UserService } from '@/services/userService';
import type { User as UserModel } from '@/types/models';
import * as XLSX from 'xlsx';

export const useUserActions = (refresh: () => void, setLoading: (loading: boolean) => void) => {
  // Create User State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ 
    name: '', email: '', password: '', role: 'member', phone: '', dob: '', avatarUrl: '', address: '', 
    balance: 0, status: 'active', isEmailVerified: false, loyaltyPoints: 0, membershipLevel: 'basic', 
    goals: { weightLoss: false, muscleGain: false, endurance: false }, trainerId: '',
    subscriptionStartDate: '', subscriptionEndDate: '', lastPaymentDate: '', nextPaymentDueDate: ''
  });

  // Edit User State
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

  // Role Change State
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<UserModel | null>(null);
  const [roleForm, setRoleForm] = useState('member');
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // View State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const userService = new UserService();

  // Create handlers
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

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // Handle nested fields like goals.weightLoss
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
      // Handle nested fields like metadata.lastLogin
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
      setFormError('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      // Convert numeric and date values
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
      
      // Remove empty fields
      Object.keys(userData).forEach(key => {
        if (userData[key] === null || userData[key] === undefined || userData[key] === '') {
          delete userData[key];
        }
      });
      
      await userService.createUser(userData);
      setIsCreateOpen(false);
      refresh();
      // Dispatch events to refresh subscription alerts (both methods for reliability)
      localStorage.setItem('user-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('user-updated'));
    } catch (err: any) {
      // Extract exact message from API if available
      let errorMessage = 'Error creating user';
      
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

  // Role change handlers
  const handleChangeRole = (id: string, currentRole: string, users: UserModel[]) => {
    const user = users.find((u: UserModel) => u._id === id);
    if (!user) return;
    setRoleUser(user);
    setRoleForm(user.role);
    setRoleError(null);
    setIsRoleOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm) {
      setRoleError('Please select a role');
      return;
    }
    setIsRoleSubmitting(true);
    try {
      await userService.updateRole(roleUser!._id, roleForm as any);
      setIsRoleOpen(false);
      refresh();
      // Dispatch events to refresh subscription alerts (both methods for reliability)
      localStorage.setItem('user-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('user-updated'));
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم تغيير الدور بنجاح' } }));
    } catch (err: any) {
      // Extract exact message from API if available
      let errorMessage = 'Error changing role';
      
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

  // Edit handlers
  const handleEdit = (id: string, users: UserModel[]) => {
    const user = users.find((u: UserModel) => u._id === id);
    if (!user) return;
    
    function dateToInputString(val: any): string {
      if (!val) return '';
      if (typeof val === 'string') {
        // If string is ISO format
        if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
        // If string is Arabic date or other format
        return '';
      }
      if (val instanceof Date) return val.toISOString().substring(0, 10);
      return '';
    }
    
    function datetimeToInputString(val: any): string {
      if (!val) return '';
      if (typeof val === 'string') {
        // If string is ISO format
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) return val.substring(0, 16);
        // If string is Arabic date or other format
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // Handle nested fields like goals.weightLoss
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
      // Handle nested fields like metadata.lastLogin
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
      setEditError('Please fill all required fields');
      return;
    }
    setIsEditSubmitting(true);
    try {
      const { _id, createdAt, updatedAt, ...toSend } = editForm;

      // Numeric fields
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

      // phone and trainerId => null if empty
      ['phone', 'trainerId'].forEach(field => {
        if (!(toSend as any)[field]) (toSend as any)[field] = null;
      });

      // barcode => omit if empty (unique field)
      if (!(toSend as any)['barcode']) delete (toSend as any)['barcode'];

      // address, avatarUrl, and healthNotes => "" if empty
      ['address', 'avatarUrl', 'healthNotes'].forEach(field => {
        if ((toSend as any)[field] === null || (toSend as any)[field] === undefined) {
          (toSend as any)[field] = '';
        }
      });

      // activityLevel => omit if empty (enum)
      if (!(toSend as any)['activityLevel']) delete (toSend as any)['activityLevel'];

      // Date fields
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

      // Allowed fields only
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
      
      // Create updated user object with all form data
      const updatedUser = { ...editUser, ...editForm };
      setViewUser(updatedUser);
      
      setIsEditOpen(false);
      refresh();
      // Dispatch events to refresh subscription alerts (both methods for reliability)
      localStorage.setItem('user-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('user-updated'));
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { type: 'success', message: 'User updated successfully' } 
      }));
    } catch (err: any) {
      console.error('Error updating user:', err);
      let errorMessage = 'Error updating user';
      if (err?.response?.data?.message) errorMessage = err.response.data.message;
      else if (err?.message?.includes('E11000 duplicate key error')) {
        errorMessage = 'Barcode already exists. Please enter a unique barcode.';
      } else if (err?.message) errorMessage = err.message;
      setEditError(errorMessage);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      await userService.deleteUser(id);
      refresh();
      // Dispatch events to refresh subscription alerts (both methods for reliability)
      localStorage.setItem('user-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('user-updated'));
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'User deleted successfully' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Error deleting user' } }));
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    setLoading(true);
    try {
      await userService.hardDeleteUser(id);
      refresh();
      // Dispatch events to refresh subscription alerts (both methods for reliability)
      localStorage.setItem('user-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('user-updated'));
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'User permanently deleted' } }));
    } catch {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Error permanently deleting user' } }));
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openDeleteModal = (id: string, type: 'soft' | 'hard') => {
    setDeleteUserId(id);
    setDeleteType(type);
    setIsDeleteOpen(true);
  };

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

  // View handler
  const openViewUser = async (id: string, usersList?: UserModel[]) => {
    setIsViewOpen(true);
    setViewUser(null);
    setViewLoading(true);
    try {
      const user = await userService.getUser(id);
      
      // Check if API returned incomplete data and merge with list data if available
      if (usersList) {
        const listUser = usersList.find(u => u._id === id);
        if (listUser) {
          // Merge API data with list data to get all fields
          const mergedUser = { ...listUser, ...user };
          setViewUser(mergedUser);
        } else {
          setViewUser(user);
        }
      } else {
        setViewUser(user);
      }
    } catch {
      setViewUser({ error: 'Failed to fetch user data' });
    } finally {
      setViewLoading(false);
    }
  };

  // Export handler
  const exportToExcel = (users: UserModel[], getRoleText: (role: string) => string) => {
    try {
      // Prepare data for export
      const exportData = users.map(user => ({
        'Name': user.name || '',
        'Email': user.email || '',
        'Role': getRoleText(user.role),
        'Phone': user.phone || '',
        'Date of Birth': user.dob ? new Date(user.dob).toLocaleDateString('ar-EG') : '',
        'Address': user.address || '',
        'Balance': user.balance || 0,
        'Status': user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Banned',
        'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
        'Subscription Start': user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString('ar-EG') : '',
        'Subscription End': user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ar-EG') : '',
        'Subscription Status': user.subscriptionStatus === 'active' ? 'Active' : user.subscriptionStatus === 'expired' ? 'Expired' : 'Cancelled',
        'Last Payment': user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString('ar-EG') : '',
        'Next Payment Due': user.nextPaymentDueDate ? new Date(user.nextPaymentDueDate).toLocaleDateString('ar-EG') : '',
        'Loyalty Points': user.loyaltyPoints || 0,
        'Membership Level': user.membershipLevel || '',
        'Goals': user.goals ? Object.entries(user.goals).filter(([_, value]) => value).map(([key, _]) => {
          const goalNames = { weightLoss: 'Weight Loss', muscleGain: 'Muscle Gain', endurance: 'Endurance' };
          return goalNames[key as keyof typeof goalNames] || key;
        }).join(', ') : '',
        'Trainer ID': user.trainerId || '',
        'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '',
        'Last Updated': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('ar-EG') : '',
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Data');

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Role
        { wch: 15 }, // Phone
        { wch: 15 }, // Date of Birth
        { wch: 30 }, // Address
        { wch: 10 }, // Balance
        { wch: 10 }, // Status
        { wch: 15 }, // Email Verified
        { wch: 20 }, // Subscription Start
        { wch: 20 }, // Subscription End
        { wch: 15 }, // Subscription Status
        { wch: 20 }, // Last Payment
        { wch: 25 }, // Next Payment Due
        { wch: 15 }, // Loyalty Points
        { wch: 15 }, // Membership Level
        { wch: 30 }, // Goals
        { wch: 15 }, // Trainer ID
        { wch: 15 }, // Created At
        { wch: 15 }, // Last Updated
      ];
      worksheet['!cols'] = columnWidths;

      // Export file
      const fileName = `Users_Data_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // Show success message
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { 
          type: 'success', 
          message: `Successfully exported ${exportData.length} users (current page)` 
        } 
      }));
    } catch (error) {
      console.error('Error exporting data:', error);
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { 
          type: 'error', 
          message: 'Error exporting data' 
        } 
      }));
    }
  };

  return {
    // Create User
    isCreateOpen,
    setIsCreateOpen,
    isSubmitting,
    formError,
    newUser,
    handleCreateChange,
    handleCreateSubmit,
    openCreate,

    // Edit User
    isEditOpen,
    setIsEditOpen,
    editUser,
    editForm,
    handleEditChange,
    handleEditSubmit,
    isEditSubmitting,
    editError,
    handleEdit,

    // Role Change
    isRoleOpen,
    setIsRoleOpen,
    roleUser,
    roleForm,
    setRoleForm,
    roleError,
    isRoleSubmitting,
    handleRoleSubmit,
    handleChangeRole,

    // Delete
    isDeleteOpen,
    setIsDeleteOpen,
    deleteType,
    confirmDelete,
    openDeleteModal,

    // View
    isViewOpen,
    setIsViewOpen,
    viewUser,
    viewLoading,
    openViewUser,

    // Export
    exportToExcel,
  };
};
