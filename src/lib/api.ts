// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to set auth token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

// Helper function to remove auth token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// API request helper with auth headers
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  // Optional debug helper: trace who triggers /users calls.
  // Enable via: localStorage.setItem('debug-users-requests', 'true')
  try {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem('debug-users-requests') === 'true' &&
      (endpoint === '/users' || endpoint.startsWith('/users?'))
    ) {
      const err = new Error(`[debug] /users request: ${options.method || 'GET'} ${endpoint}`);
      // Print a normal log with stack to avoid hidden console groups.
      console.log(err.stack || String(err));
    }
  } catch {
    // ignore localStorage/trace issues
  }

  
  

  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : apiConfig.headers;
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${apiConfig.baseURL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const isUsersById404 =
      response.status === 404 &&
      (options.method || 'GET') === 'GET' &&
      (endpoint.startsWith('/users/') || endpoint.startsWith('users/'));

    if (!isUsersById404) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response;
};

// ==================== Loyalty Points API Helpers ====================

// Helper function for loyalty points API calls
export const loyaltyApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  return apiRequest(`/loyalty-points${endpoint}`, options);
};

// Helper function for admin loyalty points API calls
export const adminLoyaltyApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  return apiRequest(`/loyalty-points/admin${endpoint}`, options);
};

// Helper function to handle API responses with error handling
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};

// Helper function for GET requests
export const apiGet = async <T>(endpoint: string): Promise<T> => {
  const response = await apiRequest(endpoint);
  return handleApiResponse<T>(response);
};

// Helper function for POST requests
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleApiResponse<T>(response);
};

// Helper function for PUT requests
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return handleApiResponse<T>(response);
};

// Helper function for DELETE requests
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
  });
  return handleApiResponse<T>(response);
};

// Helper function for file downloads
export const apiDownload = async (endpoint: string): Promise<Blob> => {
  const token = getAuthToken();
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  console.log('Download request:', url);
  console.log('Token available:', !!token);
  
  const config: RequestInit = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(url, config);
    
    console.log('Download response status:', response.status);
    console.log('Download response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Download Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || `Download failed! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('Download blob size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Download fetch error:', error);
    throw error;
  }
};