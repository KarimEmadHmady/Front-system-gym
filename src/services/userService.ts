import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/lib/constants';
import type { PaginationParams, PaginatedResponse } from '@/types';
import type { User } from '@/types/models';
import { AuthService } from './authService';
import { apiRequest } from '@/lib/api';

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'trainer' | 'member' | 'manager';
};

export class UserService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.users.list);
  }

  // Get all users with pagination
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.getAll<User>(params);
  }

  // Get user by ID
  async getUser(id: string): Promise<User> {
    return this.getById<User>(id);
  }

  // Create new user (admin)
  async createUser(userData: CreateUserPayload): Promise<User> {
    const response = await apiRequest(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  // Update user (supports optional avatar file via FormData)
  // Update user (supports optional avatar file via FormData)
  async updateUser(
    id: string,
    userData: Partial<User> & { avatarFile?: File | null }
  ): Promise<User> {
    const { avatarFile, ...rest } = userData as any;

    if (avatarFile) {
      const form = new FormData();
      form.append('avatar', avatarFile);
      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
      return this.apiCall<User>(`/${id}`, { method: 'PUT', body: form });
    }

    return this.update<User>(id, rest);
  }

  async changePassword(
    userId: string,
    passwordData: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> {
    return this.apiCall<{ message: string }>(`/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }


  // Delete user
  async deleteUser(id: string): Promise<void> {
    return this.delete(id);
  }

  // Hard delete user (admin only)
  async hardDeleteUser(id: string): Promise<void> {
    return this.apiCall<void>(API_ENDPOINTS.users.deleteHard(id), { method: 'DELETE' });
  }

  // Update role (admin only)
  async updateRole(userId: string, role: 'admin' | 'trainer' | 'member' | 'manager'): Promise<User> {
    return this.apiCall<User>(API_ENDPOINTS.users.role, {
      method: 'PUT',
      body: JSON.stringify({ userId, role })
    });
  }

  // Get users by role
  async getUsersByRole(role: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    queryParams.append('role', role);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.apiCall<PaginatedResponse<User>>(`?${queryParams.toString()}`);
  }

  // Get active users
  async getActiveUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', 'active');
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.apiCall<PaginatedResponse<User>>(`?${queryParams.toString()}`);
  }

  // Update user status
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'banned'): Promise<User> {
    return this.apiCall<User>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Update user subscription
  async updateUserSubscription(
    id: string, 
    subscriptionData: {
      startDate: Date;
      endDate: Date;
      status: 'active' | 'frozen' | 'expired' | 'cancelled';
    }
  ): Promise<User> {
    return this.apiCall<User>(`/${id}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify(subscriptionData),
    });
  }

  // Get my clients (trainer)
  async getMyClients(): Promise<User[]> {
    const res = await this.apiCall<{ clients: User[] }>(API_ENDPOINTS.users.myClients);
    return res.clients;
  }

  // Get clients of a specific trainer (admin/manager use)
  async getClientsOfTrainer(trainerId: string): Promise<User[]> {
    const url = `${API_ENDPOINTS.users.myClients}?trainerId=${encodeURIComponent(trainerId)}`;
    const res = await this.apiCall<{ clients: User[] }>(url);
    return res.clients || [];
  }
}
