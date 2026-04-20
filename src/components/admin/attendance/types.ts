import type { AttendanceRecord, User } from '@/types/models';

export interface AttendanceState {
  records: AttendanceRecord[];
  usersById: Record<string, User>;
  usersForSelect: User[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  confirmOpen: boolean;
  pendingDeleteId: string | null;
  editModalOpen: boolean;
  editRecord: AttendanceRecord | null;
  editForm: {
    userId: string;
    date: string;
    time: string;
    status: string;
    notes: string;
  };
  saving: boolean;
  addModalOpen: boolean;
  addForm: {
    userId: string;
    date: string;
    time: string;
    status: string;
    notes: string;
  };
  adding: boolean;
  searchQuery: string;
  addUserQuery: string;
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface AttendanceActions {
  setRecords: (records: AttendanceRecord[]) => void;
  setUsersById: (users: Record<string, User>) => void;
  setUsersForSelect: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDeletingId: (id: string | null) => void;
  setConfirmOpen: (open: boolean) => void;
  setPendingDeleteId: (id: string | null) => void;
  setEditModalOpen: (open: boolean) => void;
  setEditRecord: (record: AttendanceRecord | null) => void;
  setEditForm: (form: any) => void;
  setSaving: (saving: boolean) => void;
  setAddModalOpen: (open: boolean) => void;
  setAddForm: (form: any) => void;
  setAdding: (adding: boolean) => void;
  setSearchQuery: (query: string) => void;
  setAddUserQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalRecords: (total: number) => void;
  setTotalPages: (pages: number) => void;
}

export interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  form: {
    userId: string;
    date: string;
    time: string;
    status: string;
    notes: string;
  };
  setForm: (form: any) => void;
  users: User[];
  addUserQuery: string;
  setAddUserQuery: (query: string) => void;
  onSubmit: () => void;
  loading: boolean;
  title: string;
}

export interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}
