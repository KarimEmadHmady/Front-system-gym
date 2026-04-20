import type { User as UserModel } from '@/types/models';

export interface AdminUserModalsProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (v: boolean) => void;
  isSubmitting: boolean;
  formError: string | null;
  newUser: any;
  handleCreateChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  formError: string | null;
  newUser: any;
  handleCreateChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleCreateSubmit: (e: React.FormEvent) => void;
  trainers: UserModel[];
  loadingTrainers: boolean;
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
  isAvatarUploading: boolean;
  avatarPreviewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  editError: string | null;
  editUser: UserModel | null;
  editForm: any;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  trainers: UserModel[];
  loadingTrainers: boolean;
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
  isAvatarUploading: boolean;
  setIsAvatarUploading: (loading: boolean) => void;
  avatarPreviewUrl: string | null;
  setAvatarPreviewUrl: (url: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewUser: any;
  viewLoading: boolean;
  userViewFields: { key: string; label: string; type?: 'object' }[];
  resolvedTrainerName: string | null;
  trainers: UserModel[];
}

export interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleUser: UserModel | null;
  roleForm: string;
  setRoleForm: (v: string) => void;
  roleError: string | null;
  isRoleSubmitting: boolean;
  handleRoleSubmit: (e: React.FormEvent) => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  deleteType: 'soft' | 'hard';
  confirmDelete: () => void;
  user?: UserModel | null;
}
