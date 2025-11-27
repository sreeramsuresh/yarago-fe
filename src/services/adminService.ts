import { apiClient } from './api';
import type { User, PagedResponse } from '../types';

const USER_API = '/api/v1/users';
const ROLE_API = '/api/v1/roles';
const SETTINGS_API = '/api/v1/settings';
const AUDIT_API = '/api/v1/audit';
const BRANCH_API = '/api/v1/branches';

// ==================== ADMIN TYPES ====================
export interface Role {
  id: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  isSystemRole: boolean; // Cannot be deleted or modified
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  permissionCode: string;
  permissionName: string;
  module: string; // PATIENT, APPOINTMENT, CONSULTATION, BILLING, IPD, ADMIN
  action: string; // CREATE, READ, UPDATE, DELETE, APPROVE, CANCEL
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  roleIds: string[];
  branchId: string;
  departmentId?: string;
  designation?: string;
  dateOfJoining?: string;
  employeeCode?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualification?: string;
  specialization?: string;
  registrationNumber?: string; // For doctors
  consultationFee?: number; // For doctors
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  alternatePhoneNumber?: string;
  roleIds?: string[];
  branchId?: string;
  departmentId?: string;
  designation?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualification?: string;
  specialization?: string;
  consultationFee?: number;
  isActive?: boolean;
}

export interface UserFilters {
  roleId?: string;
  branchId?: string;
  departmentId?: string;
  isActive?: boolean;
  search?: string;
}

export interface SystemSettings {
  id: string;
  category: string;
  settingKey: string;
  settingValue: string;
  displayName: string;
  description?: string;
  dataType: string; // STRING, NUMBER, BOOLEAN, JSON
  isEncrypted: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface SettingsCategory {
  category: string;
  displayName: string;
  settings: SystemSettings[];
}

export interface UpdateSettingsRequest {
  settings: Array<{
    settingKey: string;
    settingValue: string;
  }>;
}

export interface AuditLog {
  id: string;
  auditId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, EXPORT, PRINT
  module: string; // PATIENT, APPOINTMENT, CONSULTATION, BILLING, IPD, ADMIN
  entityType: string; // Patient, Bill, User, etc.
  entityId: string;
  entityName?: string;
  description: string;
  ipAddress: string;
  userAgent?: string;
  branchId: string;
  branchName: string;
  requestData?: string; // JSON string
  responseData?: string; // JSON string
  status: string; // SUCCESS, FAILURE
  errorMessage?: string;
  timestamp: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  branchId?: string;
  search?: string;
}

export interface Branch {
  id: string;
  branchId: string;
  branchName: string;
  branchCode: string;
  branchType: string; // HOSPITAL, CLINIC, DIAGNOSTIC_CENTER
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstNumber?: string;
  panNumber?: string;
  registrationNumber?: string;
  headUserId?: string;
  headUserName?: string;
  isHeadOffice: boolean;
  isActive: boolean;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  branchName: string;
  branchCode: string;
  branchType: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  gstNumber?: string;
  panNumber?: string;
  registrationNumber?: string;
  headUserId?: string;
  isHeadOffice?: boolean;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleWiseBreakdown: Record<string, number>;
  branchWiseBreakdown: Record<string, number>;
  recentLogins: Array<{
    userId: string;
    userName: string;
    lastLoginAt: string;
  }>;
}

// ==================== ADMIN SERVICE ====================
export const adminService = {
  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with pagination and filters
   */
  getUsers: async (
    page: number = 0,
    size: number = 20,
    filters?: UserFilters
  ): Promise<PagedResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(filters as any)
    });
    const response = await apiClient.get(`${USER_API}?${params}`);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`${USER_API}/${id}`);
    return response.data;
  },

  /**
   * Get user by username
   */
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get(`${USER_API}/username/${username}`);
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post(USER_API, userData);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put(`${USER_API}/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`${USER_API}/${id}`);
  },

  /**
   * Activate user
   */
  activateUser: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`${USER_API}/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`${USER_API}/${id}/deactivate`);
    return response.data;
  },

  /**
   * Reset user password (admin)
   */
  resetUserPassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post(`${USER_API}/${id}/reset-password`, {
      newPassword
    });
  },

  /**
   * Change own password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post(`${USER_API}/change-password`, {
      currentPassword,
      newPassword
    });
  },

  /**
   * Unlock user account
   */
  unlockUser: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`${USER_API}/${id}/unlock`);
    return response.data;
  },

  /**
   * Search users
   */
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get(`${USER_API}/search`, {
      params: { query }
    });
    return response.data;
  },

  /**
   * Get user statistics
   */
  getUserStatistics: async (): Promise<UserStatistics> => {
    const response = await apiClient.get(`${USER_API}/statistics`);
    return response.data;
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (roleId: string): Promise<User[]> => {
    const response = await apiClient.get(`${USER_API}/role/${roleId}`);
    return response.data;
  },

  /**
   * Get users by branch
   */
  getUsersByBranch: async (branchId: string): Promise<User[]> => {
    const response = await apiClient.get(`${USER_API}/branch/${branchId}`);
    return response.data;
  },

  // ==================== ROLE MANAGEMENT ====================

  /**
   * Get all roles
   */
  getRoles: async (includeInactive: boolean = false): Promise<Role[]> => {
    const response = await apiClient.get(ROLE_API, {
      params: { includeInactive }
    });
    return response.data;
  },

  /**
   * Get role by ID
   */
  getRoleById: async (id: string): Promise<Role> => {
    const response = await apiClient.get(`${ROLE_API}/${id}`);
    return response.data;
  },

  /**
   * Create new role
   */
  createRole: async (roleData: {
    roleName: string;
    roleCode: string;
    description?: string;
    permissionIds: string[];
  }): Promise<Role> => {
    const response = await apiClient.post(ROLE_API, roleData);
    return response.data;
  },

  /**
   * Update role
   */
  updateRole: async (id: string, roleData: {
    roleName?: string;
    description?: string;
    permissionIds?: string[];
    isActive?: boolean;
  }): Promise<Role> => {
    const response = await apiClient.put(`${ROLE_API}/${id}`, roleData);
    return response.data;
  },

  /**
   * Delete role (soft delete) - only for non-system roles
   */
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`${ROLE_API}/${id}`);
  },

  /**
   * Get all permissions grouped by module
   */
  getAllPermissions: async (): Promise<Record<string, Permission[]>> => {
    const response = await apiClient.get(`${ROLE_API}/permissions`);
    return response.data;
  },

  /**
   * Get permissions for a role
   */
  getRolePermissions: async (roleId: string): Promise<Permission[]> => {
    const response = await apiClient.get(`${ROLE_API}/${roleId}/permissions`);
    return response.data;
  },

  // ==================== SYSTEM SETTINGS ====================

  /**
   * Get all system settings grouped by category
   */
  getSystemSettings: async (): Promise<SettingsCategory[]> => {
    const response = await apiClient.get(SETTINGS_API);
    return response.data;
  },

  /**
   * Get settings by category
   */
  getSettingsByCategory: async (category: string): Promise<SystemSettings[]> => {
    const response = await apiClient.get(`${SETTINGS_API}/category/${category}`);
    return response.data;
  },

  /**
   * Get setting by key
   */
  getSettingByKey: async (settingKey: string): Promise<SystemSettings> => {
    const response = await apiClient.get(`${SETTINGS_API}/key/${settingKey}`);
    return response.data;
  },

  /**
   * Update system settings
   */
  updateSystemSettings: async (settingsData: UpdateSettingsRequest): Promise<SystemSettings[]> => {
    const response = await apiClient.put(SETTINGS_API, settingsData);
    return response.data;
  },

  /**
   * Update single setting
   */
  updateSetting: async (settingKey: string, settingValue: string): Promise<SystemSettings> => {
    const response = await apiClient.put(`${SETTINGS_API}/${settingKey}`, {
      settingValue
    });
    return response.data;
  },

  /**
   * Reset settings to default (by category or all)
   */
  resetSettings: async (category?: string): Promise<SystemSettings[]> => {
    const endpoint = category
      ? `${SETTINGS_API}/reset/${category}`
      : `${SETTINGS_API}/reset`;
    const response = await apiClient.post(endpoint);
    return response.data;
  },

  // ==================== AUDIT LOGS ====================

  /**
   * Get audit logs with pagination and filters
   */
  getAuditLogs: async (
    page: number = 0,
    size: number = 50,
    filters?: AuditFilters
  ): Promise<PagedResponse<AuditLog>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(filters as any)
    });
    const response = await apiClient.get(`${AUDIT_API}?${params}`);
    return response.data;
  },

  /**
   * Get audit log by ID
   */
  getAuditLogById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get(`${AUDIT_API}/${id}`);
    return response.data;
  },

  /**
   * Get audit logs for specific entity
   */
  getEntityAuditLogs: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get(`${AUDIT_API}/entity/${entityType}/${entityId}`);
    return response.data;
  },

  /**
   * Get user activity logs
   */
  getUserActivityLogs: async (userId: string, fromDate?: string, toDate?: string): Promise<AuditLog[]> => {
    const response = await apiClient.get(`${AUDIT_API}/user/${userId}`, {
      params: { fromDate, toDate }
    });
    return response.data;
  },

  /**
   * Export audit logs to Excel
   */
  exportAuditLogs: async (filters?: AuditFilters): Promise<Blob> => {
    const response = await apiClient.get(`${AUDIT_API}/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get audit statistics
   */
  getAuditStatistics: async (fromDate?: string, toDate?: string): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    moduleWiseBreakdown: Record<string, number>;
    actionWiseBreakdown: Record<string, number>;
    topUsers: Array<{
      userId: string;
      userName: string;
      actionCount: number;
    }>;
  }> => {
    const response = await apiClient.get(`${AUDIT_API}/statistics`, {
      params: { fromDate, toDate }
    });
    return response.data;
  },

  // ==================== BRANCH MANAGEMENT ====================

  /**
   * Get all branches
   */
  getBranches: async (isActive?: boolean): Promise<Branch[]> => {
    const response = await apiClient.get(BRANCH_API, {
      params: { isActive }
    });
    return response.data;
  },

  /**
   * Get branch by ID
   */
  getBranchById: async (id: string): Promise<Branch> => {
    const response = await apiClient.get(`${BRANCH_API}/${id}`);
    return response.data;
  },

  /**
   * Create new branch
   */
  createBranch: async (branchData: CreateBranchRequest): Promise<Branch> => {
    const response = await apiClient.post(BRANCH_API, branchData);
    return response.data;
  },

  /**
   * Update branch
   */
  updateBranch: async (id: string, branchData: Partial<Branch>): Promise<Branch> => {
    const response = await apiClient.put(`${BRANCH_API}/${id}`, branchData);
    return response.data;
  },

  /**
   * Delete branch (soft delete)
   */
  deleteBranch: async (id: string): Promise<void> => {
    await apiClient.delete(`${BRANCH_API}/${id}`);
  },

  /**
   * Activate branch
   */
  activateBranch: async (id: string): Promise<Branch> => {
    const response = await apiClient.patch(`${BRANCH_API}/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate branch
   */
  deactivateBranch: async (id: string): Promise<Branch> => {
    const response = await apiClient.patch(`${BRANCH_API}/${id}/deactivate`);
    return response.data;
  },

  // ==================== SYSTEM OPERATIONS ====================

  /**
   * Get system health status
   */
  getSystemHealth: async (): Promise<{
    status: string;
    services: Record<string, {
      status: string;
      responseTime: number;
      lastChecked: string;
    }>;
    database: {
      status: string;
      connections: number;
    };
    redis: {
      status: string;
      memory: string;
    };
  }> => {
    const response = await apiClient.get('/api/v1/system/health');
    return response.data;
  },

  /**
   * Get system configuration
   */
  getSystemConfig: async (): Promise<Record<string, any>> => {
    const response = await apiClient.get('/api/v1/system/config');
    return response.data;
  },

  /**
   * Clear cache
   */
  clearCache: async (cacheType?: string): Promise<void> => {
    await apiClient.post('/api/v1/system/clear-cache', {
      cacheType
    });
  },

  /**
   * Backup database
   */
  backupDatabase: async (): Promise<{
    backupId: string;
    backupPath: string;
    backupSize: number;
    timestamp: string;
  }> => {
    const response = await apiClient.post('/api/v1/system/backup');
    return response.data;
  },

  /**
   * Get system logs
   */
  getSystemLogs: async (
    level?: string,
    fromDate?: string,
    toDate?: string,
    limit?: number
  ): Promise<Array<{
    timestamp: string;
    level: string;
    logger: string;
    message: string;
    exception?: string;
  }>> => {
    const response = await apiClient.get('/api/v1/system/logs', {
      params: { level, fromDate, toDate, limit }
    });
    return response.data;
  }
};

export default adminService;
