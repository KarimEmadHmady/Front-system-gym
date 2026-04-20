import { useEffect, useState, useMemo, useRef } from 'react';
import { AttendanceService } from '@/services/attendanceService';
import type { AttendanceRecord } from '@/types/models';
import { UserService } from '@/services/userService';
import type { User } from '@/types/models';
import type { AttendanceState, AttendanceActions } from './types';
import * as XLSX from 'xlsx';

export const useAttendance = () => {
  const notFoundUserIdsRef = useRef<Set<string>>(new Set());
  
  const [state, setState] = useState<AttendanceState>({
    records: [],
    usersById: {},
    usersForSelect: [],
    loading: false,
    error: null,
    deletingId: null,
    confirmOpen: false,
    pendingDeleteId: null,
    editModalOpen: false,
    editRecord: null,
    editForm: { userId: '', date: '', time: '', status: 'present', notes: '' },
    saving: false,
    addModalOpen: false,
    addForm: { userId: '', date: '', time: '', status: 'present', notes: '' },
    adding: false,
    searchQuery: '',
    addUserQuery: '',
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
  });

  const updateState = (updates: Partial<AttendanceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Fetch attendance records and users
  useEffect(() => {
    const fetchData = async () => {
      updateState({ loading: true, error: null });
      try {
        const attendanceRes = await new AttendanceService().getAttendanceRecords({ 
          page: state.currentPage, 
          limit: state.pageSize 
        });
        const pageRecords: AttendanceRecord[] = (attendanceRes as any)?.data || [];
        const pagination = (attendanceRes as any)?.pagination || {};
        
        updateState({
          records: pageRecords,
          totalRecords: Number(pagination.total ?? pageRecords.length ?? 0),
          totalPages: Number(pagination.totalPages ?? 1) || 1,
        });

        // Load only users needed for this page's records
        const userIds = Array.from(new Set(pageRecords.map(r => r.userId).filter(Boolean))) as string[];
        const missing = userIds.filter((id) => !state.usersById[id] && !notFoundUserIdsRef.current.has(id));
        
        if (missing.length > 0) {
          const userSvc = new UserService();
          const fetched = await Promise.all(
            missing.map((id) =>
              userSvc
                .getUser(id)
                .then((u) => ({ id, user: u as any }))
                .catch(() => ({ id, user: null as any }))
            )
          );

          const nextUsersById = { ...state.usersById };
          fetched.forEach(({ id, user }) => {
            if (user && user._id) {
              nextUsersById[user._id] = user;
            } else {
              notFoundUserIdsRef.current.add(id);
            }
          });
          updateState({ usersById: nextUsersById });
        }
      } catch (e: any) {
        updateState({ error: e?.message || 'Failed to fetch data' });
      } finally {
        updateState({ loading: false });
      }
    };
    fetchData();
  }, [state.currentPage, state.pageSize]);

  // Lazy-load users list for add/edit selects
  useEffect(() => {
    const shouldLoad = state.addModalOpen || state.editModalOpen;
    if (!shouldLoad) return;
    if (state.usersForSelect.length > 0) return;

    (async () => {
      try {
        const res = await new UserService().getUsers({ 
          page: 1, 
          limit: 200, 
          sortBy: 'name', 
          sortOrder: 'asc' 
        } as any);
        const arr: User[] = (res as any)?.data || [];
        updateState({ usersForSelect: arr });
      } catch {
        updateState({ usersForSelect: [] });
      }
    })();
  }, [state.addModalOpen, state.editModalOpen, state.usersForSelect.length]);

  // Reset page when search changes
  useEffect(() => {
    if (state.searchQuery !== '') {
      updateState({ currentPage: 1 });
    }
  }, [state.searchQuery]);

  // Computed values
  const userMap = useMemo(() => state.usersById, [state.usersById]);

  const filteredRecords = useMemo(() => {
    const query = state.searchQuery.trim().toLowerCase();
    if (!query) return state.records;
    return state.records.filter((rec) => {
      const user = userMap[rec.userId];
      const name = (user?.name || '').toLowerCase();
      const phone = (user?.phone || '').toLowerCase();
      return name.includes(query) || phone.includes(query);
    });
  }, [state.records, userMap, state.searchQuery]);

  const filteredAddUsers = useMemo(() => {
    const q = state.addUserQuery.trim().toLowerCase();
    if (!q) return state.usersForSelect;
    return state.usersForSelect.filter(u => 
      (u.name || '').toLowerCase().includes(q) || 
      (u.phone || '').toLowerCase().includes(q)
    );
  }, [state.usersForSelect, state.addUserQuery]);

  const paginatedRecords = filteredRecords;
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = Math.min(startIndex + state.pageSize, state.totalRecords);

  // Actions
  const actions: AttendanceActions = {
    setRecords: (records) => updateState({ records }),
    setUsersById: (users) => updateState({ usersById: users }),
    setUsersForSelect: (users) => updateState({ usersForSelect: users }),
    setLoading: (loading) => updateState({ loading }),
    setError: (error) => updateState({ error }),
    setDeletingId: (id) => updateState({ deletingId: id }),
    setConfirmOpen: (open) => updateState({ confirmOpen: open }),
    setPendingDeleteId: (id) => updateState({ pendingDeleteId: id }),
    setEditModalOpen: (open) => updateState({ editModalOpen: open }),
    setEditRecord: (record) => updateState({ editRecord: record }),
    setEditForm: (form) => updateState({ editForm: form }),
    setSaving: (saving) => updateState({ saving }),
    setAddModalOpen: (open) => updateState({ addModalOpen: open }),
    setAddForm: (form) => updateState({ addForm: form }),
    setAdding: (adding) => updateState({ adding }),
    setSearchQuery: (query) => updateState({ searchQuery: query }),
    setAddUserQuery: (query) => updateState({ addUserQuery: query }),
    setCurrentPage: (page) => updateState({ currentPage: page }),
    setTotalRecords: (total) => updateState({ totalRecords: total }),
    setTotalPages: (pages) => updateState({ totalPages: pages }),
  };

  // CRUD operations
  const handleDelete = async (id: string) => {
    actions.setPendingDeleteId(id);
    actions.setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!state.pendingDeleteId) return;
    actions.setDeletingId(state.pendingDeleteId);
    try {
      await new AttendanceService().deleteAttendanceRecord(state.pendingDeleteId);
      const currentRecords = state.records;
      const newRecords = currentRecords.filter(r => r._id !== state.pendingDeleteId);
      actions.setRecords(newRecords);
    } catch (e: any) {
      console.error('Delete error:', e);
    } finally {
      actions.setDeletingId(null);
      actions.setPendingDeleteId(null);
      actions.setConfirmOpen(false);
    }
  };

  const openEditModal = (rec: AttendanceRecord) => {
    actions.setEditRecord(rec);
    actions.setEditForm({
      userId: rec.userId,
      date: new Date(rec.date).toISOString().slice(0, 10),
      time: new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: rec.status,
      notes: rec.notes || '',
    });
    actions.setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!state.editRecord) return;
    actions.setSaving(true);
    try {
      const dateTime = new Date(state.editForm.date + 'T' + state.editForm.time);
      const updated = await new AttendanceService().updateAttendanceRecord(state.editRecord._id, {
        userId: state.editForm.userId,
        date: dateTime,
        status: state.editForm.status as 'present' | 'absent' | 'excused',
        notes: state.editForm.notes,
      });
      const currentRecords = state.records;
      const newRecords = currentRecords.map((r: AttendanceRecord) => 
        r._id === state.editRecord!._id ? { ...r, ...updated } : r
      );
      actions.setRecords(newRecords);
      actions.setEditModalOpen(false);
      actions.setEditRecord(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to update');
    } finally {
      actions.setSaving(false);
    }
  };

  const openAddModal = () => {
    actions.setAddForm({ userId: '', date: '', time: '', status: 'present', notes: '' });
    actions.setAddUserQuery('');
    actions.setAddModalOpen(true);
  };

  const handleAddSave = async () => {
    actions.setAdding(true);
    try {
      const dateTime = new Date(state.addForm.date + 'T' + state.addForm.time);
      const created = await new AttendanceService().createAttendanceRecord({
        userId: state.addForm.userId,
        date: dateTime,
        status: state.addForm.status as 'present' | 'absent' | 'excused',
        notes: state.addForm.notes,
      });
      const currentRecords = state.records;
      const newRecords = [created, ...currentRecords].slice(0, state.pageSize);
      actions.setRecords(newRecords);
      actions.setAddModalOpen(false);
    } catch (e: any) {
      alert(e?.message || 'Failed to add');
    } finally {
      actions.setAdding(false);
    }
  };

  const handleExportToExcel = () => {
    const exportData = filteredRecords.map((rec) => {
      const user = userMap[rec.userId];
      const dateObj = new Date(rec.date);
      return {
        'Member Name': user?.name || '---',
        'Phone': user?.phone || '-',
        'Date': dateObj.toLocaleDateString('en-GB'),
        'Time': dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        'Status': rec.status === 'present' ? 'Present' : rec.status === 'absent' ? 'Absent' : 'Excused',
        'Notes': rec.notes || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');
    
    const fileName = `Attendance_Records_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return {
    ...state,
    userMap,
    filteredRecords,
    filteredAddUsers,
    paginatedRecords,
    startIndex,
    endIndex,
    actions,
    handleDelete,
    confirmDelete,
    openEditModal,
    handleEditSave,
    openAddModal,
    handleAddSave,
    handleExportToExcel,
  };
};
