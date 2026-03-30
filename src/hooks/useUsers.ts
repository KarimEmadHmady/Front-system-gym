'use client';

import { useCallback, useMemo, useState } from 'react';
import { UserService, CreateUserPayload } from '@/services/userService';
import type { User } from '@/types';

export function useUsers() {
  const service = useMemo(() => new UserService(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await service.getUsers();
      return res.data || [];
    } catch (e) {
      setError('Failed to fetch users');
      return [] as User[];
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const get = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await service.getUser(id);
    } catch (e) {
      setError('Failed to fetch user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const create = useCallback(async (payload: CreateUserPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await service.createUser(payload);
    } catch (e) {
      setError('Failed to create user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const update = useCallback(async (id: string, payload: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await service.updateUser(id, payload);
    } catch (e) {
      setError('Failed to update user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await service.deleteUser(id);
      return true;
    } catch (e) {
      setError('Failed to delete user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const hardRemove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await service.hardDeleteUser(id);
      return true;
    } catch (e) {
      setError('Failed to hard delete user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const updateRole = useCallback(async (userId: string, role: 'admin' | 'trainer' | 'member' | 'manager') => {
    setIsLoading(true);
    setError(null);
    try {
      return await service.updateRole(userId, role);
    } catch (e) {
      setError('Failed to update role');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return { list, get, create, update, remove, hardRemove, updateRole, isLoading, error };
}


