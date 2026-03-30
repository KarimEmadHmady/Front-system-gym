// Authentication Types


export interface LoginCredentials {
  identifier: string; // Changed from email
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    barcode: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'member' | 'manager' | 'accountant' | 'super_admin';
  barcode: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResult {
  success: boolean;
  error?: string;
} 