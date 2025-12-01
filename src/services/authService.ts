import { apiClient } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const AUTH_API = '/api/v1/auth';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(`${AUTH_API}/login`, credentials);
    // API returns { data: { accessToken, refreshToken, user }, success, message }
    const authData = response.data.data;

    // Store auth data
    if (authData.accessToken) {
      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }

    return authData;
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
    // API returns { data: { accessToken, ... }, success, message }
    const authData = response.data.data;

    // Update stored token
    if (authData.accessToken) {
      localStorage.setItem('token', authData.accessToken);
    }

    return authData;
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
  },

  // ==================== USER MANAGEMENT (Admin only) ====================

  /**
   * Get all users (Admin only)
   */
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(`${AUTH_API}/users`);
    return response.data.data || response.data;
  },

  /**
   * Get user by ID (Admin only)
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`${AUTH_API}/users/${userId}`);
    return response.data.data || response.data;
  },

  /**
   * Create new user (Admin only)
   */
  createUser: async (userData: any): Promise<User> => {
    const response = await apiClient.post(`${AUTH_API}/users`, userData);
    return response.data.data || response.data;
  },

  /**
   * Update user (Admin only)
   */
  updateUser: async (userId: string, userData: any): Promise<User> => {
    const response = await apiClient.put(`${AUTH_API}/users/${userId}`, userData);
    return response.data.data || response.data;
  },

  /**
   * Toggle user active status (Admin only)
   */
  toggleUserStatus: async (userId: string, active: boolean): Promise<void> => {
    await apiClient.patch(`${AUTH_API}/users/${userId}/status`, { active });
  },

  /**
   * Reset user password (Admin only)
   */
  resetUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    await apiClient.post(`${AUTH_API}/users/${userId}/reset-password`, { newPassword });
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`${AUTH_API}/users/${userId}`);
  },

  /**
   * Get all roles
   */
  getRoles: async (): Promise<any[]> => {
    const response = await apiClient.get(`${AUTH_API}/roles`);
    return response.data.data || response.data;
  }
};

export default authService;
