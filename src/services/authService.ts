import { apiRequest, setAuthToken, removeAuthToken } from '@/lib/api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '@/types';

// Auth Service
export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      // Store token in localStorage
      if (data.token) {
        setAuthToken(data.token);
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  // Register user
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      // Store token in localStorage if provided
      if (data.token) {
        setAuthToken(data.token);
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  // Logout user
  static logout(): void {
    removeAuthToken();
  }

  // Get current user (if you have a /me endpoint)
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiRequest('/auth/me');
      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user data');
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get stored token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }
}