import { apiClient } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const AUTH_API = '/api/v1/auth';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(`${AUTH_API}/login`, credentials);
    const data = response.data;

    // Store auth data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(`${AUTH_API}/register`, userData);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post(`${AUTH_API}/refresh`, { refreshToken });
    const data = response.data;

    // Update stored token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API}/logout`);
    } finally {
      // Clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get(`${AUTH_API}/profile`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`${AUTH_API}/profile`, userData);

    // Update stored user data
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post(`${AUTH_API}/change-password`, {
      currentPassword,
      newPassword
    });
  }
};

export default authService;
