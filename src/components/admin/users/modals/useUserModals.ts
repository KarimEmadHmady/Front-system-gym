import { useEffect, useMemo, useState, useRef } from 'react';
import type { User as UserModel } from '@/types/models';
import { UserService } from '@/services/userService';
import { normalizeId } from './utils';

export const useUserModals = () => {
  const userSvc = useMemo(() => new UserService(), []);
  const [trainers, setTrainers] = useState<UserModel[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const trainersLoadedRef = useRef(false);
  const [resolvedTrainerName, setResolvedTrainerName] = useState<string | null>(null);
  const resolvedTrainerIdRef = useRef<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load trainers when needed
  const loadTrainers = async (needsTrainers: boolean) => {
    if (!needsTrainers) return;
    if (trainersLoadedRef.current) return;

    setLoadingTrainers(true);
    try {
      const res = await userSvc.getUsersByRole('trainer', { 
        page: 1, 
        limit: 1000, 
        sortBy: 'name', 
        sortOrder: 'asc' 
      } as any);
      const arr = Array.isArray(res) ? (res as unknown as UserModel[]) : ((res as any)?.data || []);
      setTrainers(arr);
      trainersLoadedRef.current = true;
    } catch {
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  };

  // Resolve trainer name for View modal
  const resolveTrainerName = async (viewUser: any) => {
    const raw = viewUser?.trainerId;

    // If backend already populated trainerId with name, use it directly
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

    // If trainers list already contains it, use it
    const matched = trainers.find((t) => normalizeId(t._id) === trainerId);
    if (matched?.name) {
      setResolvedTrainerName(matched.name);
      resolvedTrainerIdRef.current = trainerId;
      return;
    }

    // Avoid duplicate requests for the same id
    if (resolvedTrainerIdRef.current === trainerId) return;
    resolvedTrainerIdRef.current = trainerId;

    setResolvedTrainerName(null);
    userSvc
      .getUser(trainerId)
      .then((u) => setResolvedTrainerName(u?.name ?? null))
      .catch(() => setResolvedTrainerName(null));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File, userId?: string) => {
    if (!file) return null;

    setIsAvatarUploading(true);
    try {
      // Here you would implement the actual avatar upload logic
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful upload
      const mockUrl = URL.createObjectURL(file);
      setAvatarPreviewUrl(mockUrl);
      setUploadSuccess(true);
      return mockUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      return null;
    } finally {
      setIsAvatarUploading(false);
    }
  };

  // Update preview URL when user or edit form changes
  const updateAvatarPreview = (viewUser?: any, editForm?: any) => {
    const url = (viewUser?.avatarUrl || editForm?.avatarUrl || '') as string;
    setAvatarPreviewUrl(url || null);
  };

  return {
    // State
    trainers,
    loadingTrainers,
    resolvedTrainerName,
    avatarFile,
    isAvatarUploading,
    avatarPreviewUrl,
    uploadSuccess,
    fileInputRef,
    
    // Actions
    loadTrainers,
    resolveTrainerName,
    handleAvatarUpload,
    updateAvatarPreview,
    setAvatarFile,
    setAvatarPreviewUrl,
    setIsAvatarUploading,
    setUploadSuccess,
  };
};
