// ==================== AUTH TYPES ====================
export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  roles: string[];
  branchId: string;
  branchName: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  branchId: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
}

// ==================== PATIENT TYPES ====================
export interface Patient {
  id: string;
  uhid: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation?: string;
  referredBy?: string;
  branchId: string;
  branchName: string;
  isTemporary: boolean;
  isActive: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation?: string;
  referredBy?: string;
  branchId: string;
  isTemporary: boolean;
}

export interface PatientHistory {
  id: string;
  patientId: string;
  historyType: string;
  description: string;
  recordedDate: string;
  recordedBy: string;
}

// ==================== APPOINTMENT TYPES ====================
export interface Appointment {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  consultantId: string;
  consultantName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  appointmentType: string;
  status: string;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  consultantId: string;
  departmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  notes?: string;
  branchId: string;
}

export interface Consultant {
  id: string;
  consultantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialization: string;
  qualification: string;
  departmentId: string;
  departmentName: string;
  phoneNumber: string;
  email: string;
  consultationFee: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  departmentId: string;
  departmentName: string;
  description: string;
  isActive: boolean;
}

// ==================== CONSULTATION TYPES ====================
export interface OptometryExamination {
  id: string;
  examinationId: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  examinationDate: string;
  performedBy: string;
  performedByName: string;

  // Vision measurements
  visualAcuityRightEye?: string;
  visualAcuityLeftEye?: string;
  currentGlassesRightEye?: string;
  currentGlassesLeftEye?: string;

  // Refraction
  rightEyeSphere?: number;
  rightEyeCylinder?: number;
  rightEyeAxis?: number;
  rightEyeVision?: string;
  leftEyeSphere?: number;
  leftEyeCylinder?: number;
  leftEyeAxis?: number;
  leftEyeVision?: string;

  // IOP and other measurements
  iopRightEye?: number;
  iopLeftEye?: number;
  notes?: string;

  status: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorConsultation {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  consultantId: string;
  consultantName: string;
  consultationDate: string;

  chiefComplaint?: string;
  presentIllness?: string;
  pastHistory?: string;
  diagnosis?: string;
  treatment?: string;
  advice?: string;
  followUpDate?: string;
  followUpPeriod?: string;

  status: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  consultationId: string;
  consultantId: string;
  consultantName: string;
  prescriptionDate: string;

  // Prescription details
  rightEyeSphere?: number;
  rightEyeCylinder?: number;
  rightEyeAxis?: number;
  rightEyeVision?: string;
  leftEyeSphere?: number;
  leftEyeCylinder?: number;
  leftEyeAxis?: number;
  leftEyeVision?: string;

  medications: Medication[];

  notes?: string;
  isValid: boolean;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  eye?: string; // Both, Right, Left
}

// ==================== BILLING TYPES ====================
export interface Bill {
  id: string;
  billId: string;
  billNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentId?: string;
  consultationId?: string;
  billDate: string;

  items: BillItem[];

  subtotal: number;
  discount: number;
  discountType: string;
  discountReason?: string;
  cgst: number;
  sgst: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;

  status: string;
  paymentStatus: string;

  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;

  branchId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BillItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
}

export interface Payment {
  id: string;
  paymentId: string;
  billId: string;
  billNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  transactionReference?: string;
  notes?: string;
  receivedBy: string;
  receivedByName: string;
  createdAt: string;
}

export interface ServiceMaster {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  basePrice: number;
  cgstRate: number;
  sgstRate: number;
  description?: string;
  isActive: boolean;
}

export interface DailyReportSummary {
  date: string;
  totalBills: number;
  totalRevenue: number;
  totalCollections: number;
  pendingAmount: number;
  cancelledBills: number;
  paymentModeBreakdown: Record<string, number>;
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string;
  notificationId: string;
  recipientId: string;
  recipientType: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  notificationType: string;
  templateCode?: string;
  templateName?: string;
  subject?: string;
  message: string;
  messageParams?: Record<string, string>;
  status: string;
  priority: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  retryCount?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRequest {
  recipientId: string;
  recipientType: 'PATIENT' | 'STAFF';
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  notificationType: 'SMS' | 'EMAIL' | 'PUSH' | 'WEBSOCKET';
  templateCode?: string;
  subject?: string;
  message?: string;
  messageParams?: Record<string, string>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  scheduledAt?: string;
}

export interface NotificationTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  templateType: string;
  category: string;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  error?: string;
  timestamp?: string;
}
