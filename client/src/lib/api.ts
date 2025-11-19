// API client utilities for GlamAR

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// Token management
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// API request helper with auth
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = tokenStorage.getAccessToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle 401 - try to refresh token
  if (response.status === 401 && tokenStorage.getRefreshToken()) {
    const refreshToken = tokenStorage.getRefreshToken();
    const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      tokenStorage.setTokens({
        access_token: data.access_token,
        refresh_token: refreshToken!,
      });
      
      // Retry original request with new token
      headers.set('Authorization', `Bearer ${data.access_token}`);
      return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    } else {
      // Refresh failed - clear tokens
      tokenStorage.clearTokens();
      window.location.href = '/login';
    }
  }
  
  return response;
}

// Auth API
export const authAPI = {
  async signup(email: string, username: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  },
  
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    tokenStorage.setTokens(data);
    return data;
  },
  
  async me() {
    const response = await apiRequest('/auth/me');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  },
  
  logout() {
    tokenStorage.clearTokens();
    window.location.href = '/login';
  },
};

// Try-on API
export const tryonAPI = {
  async create(humanImage: File, garmentImage?: File, garmentUrl?: string, productId?: string) {
    const formData = new FormData();
    formData.append('humanImage', humanImage);
    
    if (garmentImage) {
      formData.append('garmentImage', garmentImage);
    }
    if (garmentUrl) {
      formData.append('garmentUrl', garmentUrl);
    }
    if (productId) {
      formData.append('productId', productId);
    }
    
    const response = await apiRequest('/api/tryon', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Try-on creation failed');
    }
    
    return response.json();
  },
  
  async get(id: string) {
    const response = await apiRequest(`/api/tryon/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch try-on');
    }
    
    return response.json();
  },
  
  async list(limit?: number) {
    const url = `/api/tryon${limit ? `?limit=${limit}` : ''}`;
    const response = await apiRequest(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch try-ons');
    }
    
    return response.json();
  },
  
  async delete(id: string) {
    const response = await apiRequest(`/api/tryon/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete try-on');
    }
    
    return response.json();
  },
};

// Integration API
export const integrationAPI = {
  async list() {
    const response = await apiRequest('/api/integrations');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch integrations');
    }
    
    return response.json();
  },
  
  async create(allowedDomains: string[]) {
    const response = await apiRequest('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedDomains }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create integration');
    }
    
    return response.json();
  },
};

// Admin API
export const adminAPI = {
  async getMetrics() {
    const response = await apiRequest('/api/admin/metrics');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch metrics');
    }
    
    return response.json();
  },
  
  async purgeCache() {
    const response = await apiRequest('/api/admin/purge-cache', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to purge cache');
    }
    
    return response.json();
  },
};
