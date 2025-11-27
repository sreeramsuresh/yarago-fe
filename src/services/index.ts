/**
 * Service Layer - Centralized API client exports
 *
 * All service modules follow consistent patterns:
 * - Use apiClient from './api' for HTTP requests
 * - Include proper TypeScript types for requests/responses
 * - Handle errors gracefully with try-catch where needed
 * - Export service objects with named methods
 */

export { default as apiClient } from './api';
export { default as authService } from './authService';
export { default as patientService } from './patientService';
export { default as appointmentService } from './appointmentService';
export { default as consultationService } from './consultationService';
export { default as billingService } from './billingService';
export { default as notificationService } from './notificationService';
export { default as ipdService } from './ipdService';
export { default as adminService } from './adminService';
export { default as masterDataService } from './masterDataService';

// Re-export types from individual services
export type {
  // IPD Service Types
  Ward,
  Bed,
  Admission,
  CreateWardRequest,
  CreateBedRequest,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  DischargeRequest,
  TransferRequest,
  IPDBilling,
  AdmissionFilters
} from './ipdService';

export type {
  // Admin Service Types
  Role,
  Permission,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  SystemSettings,
  SettingsCategory,
  UpdateSettingsRequest,
  AuditLog,
  AuditFilters,
  Branch,
  CreateBranchRequest,
  UserStatistics
} from './adminService';

export type {
  // Master Data Service Types
  ChiefComplaint,
  MedicalHistoryOption,
  DiagnosisCode,
  Drug,
  ClinicalFinding,
  AdviceTemplate,
  ICDCode,
  CreateChiefComplaintRequest,
  CreateMedicalHistoryRequest,
  CreateDiagnosisRequest,
  CreateDrugRequest,
  CreateClinicalFindingRequest,
  CreateAdviceTemplateRequest
} from './masterDataService';
