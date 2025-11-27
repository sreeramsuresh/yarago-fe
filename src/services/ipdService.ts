import { apiClient } from './api';
import type { Patient, PagedResponse } from '../types';

const IPD_API = '/api/v1/ipd';
const WARD_API = '/api/v1/wards';
const BED_API = '/api/v1/beds';
const ADMISSION_API = '/api/v1/admissions';

// ==================== IPD TYPES ====================
export interface Ward {
  id: string;
  wardId: string;
  wardName: string;
  wardType: string; // GENERAL, PRIVATE, ICU, SEMI_PRIVATE
  floorNumber: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  description?: string;
  facilities?: string[];
  nursingStationPhone?: string;
  isActive: boolean;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWardRequest {
  wardName: string;
  wardType: string;
  floorNumber: number;
  totalBeds: number;
  description?: string;
  facilities?: string[];
  nursingStationPhone?: string;
  branchId: string;
}

export interface Bed {
  id: string;
  bedId: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  bedType: string; // STANDARD, DELUXE, ICU, ISOLATION
  status: string; // AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED, BLOCKED
  dailyCharges: number;
  currentPatientId?: string;
  currentPatientName?: string;
  currentAdmissionId?: string;
  admissionDate?: string;
  lastMaintenanceDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBedRequest {
  bedNumber: string;
  wardId: string;
  bedType: string;
  dailyCharges: number;
  status?: string;
  notes?: string;
}

export interface Admission {
  id: string;
  admissionId: string;
  admissionNumber: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;

  // Admission details
  admissionDate: string;
  admissionTime: string;
  admissionType: string; // EMERGENCY, PLANNED, TRANSFER
  admissionCategory: string; // SURGERY, OBSERVATION, TREATMENT

  // Ward and bed allocation
  wardId: string;
  wardName: string;
  bedId: string;
  bedNumber: string;

  // Medical details
  primaryDoctorId: string;
  primaryDoctorName: string;
  departmentId: string;
  departmentName: string;
  provisionalDiagnosis: string;
  chiefComplaint: string;
  medicalHistory?: string;
  allergies?: string;

  // Admission vitals
  temperature?: number;
  bloodPressure?: string;
  pulse?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight?: number;
  height?: number;

  // Status and discharge
  status: string; // ADMITTED, DISCHARGED, TRANSFERRED, ABSCONDED, DECEASED
  dischargeDate?: string;
  dischargeTime?: string;
  dischargeSummary?: string;
  dischargeType?: string; // NORMAL, AGAINST_MEDICAL_ADVICE, ABSCONDED, LAMA, DEATH
  dischargedBy?: string;
  dischargedByName?: string;

  // Financial
  advanceAmount: number;
  estimatedCharges: number;
  totalCharges: number;
  paidAmount: number;
  balanceAmount: number;

  // Additional info
  attendantName?: string;
  attendantPhone?: string;
  attendantRelation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialInstructions?: string;

  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceClaimNumber?: string;

  // Metadata
  branchId: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionRequest {
  patientId: string;
  admissionDate: string;
  admissionTime: string;
  admissionType: string;
  admissionCategory: string;
  wardId: string;
  bedId: string;
  primaryDoctorId: string;
  departmentId: string;
  provisionalDiagnosis: string;
  chiefComplaint: string;
  medicalHistory?: string;
  allergies?: string;

  // Vitals
  temperature?: number;
  bloodPressure?: string;
  pulse?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight?: number;
  height?: number;

  // Additional info
  attendantName?: string;
  attendantPhone?: string;
  attendantRelation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialInstructions?: string;
  advanceAmount?: number;
  estimatedCharges?: number;

  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;

  branchId: string;
}

export interface UpdateAdmissionRequest {
  wardId?: string;
  bedId?: string;
  primaryDoctorId?: string;
  provisionalDiagnosis?: string;
  medicalHistory?: string;
  allergies?: string;
  specialInstructions?: string;
  attendantName?: string;
  attendantPhone?: string;
  attendantRelation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface DischargeRequest {
  dischargeDate: string;
  dischargeTime: string;
  dischargeSummary: string;
  dischargeType: string;
  finalDiagnosis?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  medications?: DischargeMedication[];
  documents?: string[];
}

export interface DischargeMedication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface TransferRequest {
  newWardId: string;
  newBedId: string;
  transferReason: string;
  transferredBy: string;
  transferNotes?: string;
}

export interface AdmissionFilters {
  status?: string;
  wardId?: string;
  departmentId?: string;
  patientId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface IPDBilling {
  admissionId: string;
  admissionNumber: string;
  patientName: string;

  // Room charges
  bedCharges: number;
  numberOfDays: number;
  totalBedCharges: number;

  // Medical charges
  consultationCharges: number;
  procedureCharges: number;
  investigationCharges: number;
  medicationCharges: number;
  otherCharges: number;

  // Summary
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  // Status
  billStatus: string;
  generatedAt?: string;
  generatedBy?: string;
}

// ==================== WARD MANAGEMENT ====================
export const ipdService = {
  // ==================== WARD OPERATIONS ====================

  /**
   * Get all wards with optional filters
   */
  getWards: async (filters?: {
    isActive?: boolean;
    wardType?: string;
    branchId?: string;
  }): Promise<Ward[]> => {
    const response = await apiClient.get(WARD_API, { params: filters });
    return response.data;
  },

  /**
   * Get ward by ID with bed details
   */
  getWardById: async (id: string): Promise<Ward> => {
    const response = await apiClient.get(`${WARD_API}/${id}`);
    return response.data;
  },

  /**
   * Create new ward
   */
  createWard: async (wardData: CreateWardRequest): Promise<Ward> => {
    const response = await apiClient.post(WARD_API, wardData);
    return response.data;
  },

  /**
   * Update ward details
   */
  updateWard: async (id: string, wardData: Partial<Ward>): Promise<Ward> => {
    const response = await apiClient.put(`${WARD_API}/${id}`, wardData);
    return response.data;
  },

  /**
   * Delete ward (soft delete)
   */
  deleteWard: async (id: string): Promise<void> => {
    await apiClient.delete(`${WARD_API}/${id}`);
  },

  /**
   * Get ward occupancy statistics
   */
  getWardOccupancy: async (wardId?: string): Promise<{
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
    wardWiseBreakdown?: Record<string, any>;
  }> => {
    const endpoint = wardId ? `${WARD_API}/${wardId}/occupancy` : `${WARD_API}/occupancy`;
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // ==================== BED OPERATIONS ====================

  /**
   * Get all beds with optional ward filter
   */
  getBeds: async (filters?: {
    wardId?: string;
    status?: string;
    bedType?: string;
    isActive?: boolean;
  }): Promise<Bed[]> => {
    const response = await apiClient.get(BED_API, { params: filters });
    return response.data;
  },

  /**
   * Get bed by ID
   */
  getBedById: async (id: string): Promise<Bed> => {
    const response = await apiClient.get(`${BED_API}/${id}`);
    return response.data;
  },

  /**
   * Create new bed
   */
  createBed: async (bedData: CreateBedRequest): Promise<Bed> => {
    const response = await apiClient.post(BED_API, bedData);
    return response.data;
  },

  /**
   * Update bed details
   */
  updateBed: async (id: string, bedData: Partial<Bed>): Promise<Bed> => {
    const response = await apiClient.put(`${BED_API}/${id}`, bedData);
    return response.data;
  },

  /**
   * Update bed status (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED, BLOCKED)
   */
  updateBedStatus: async (id: string, status: string, notes?: string): Promise<Bed> => {
    const response = await apiClient.patch(`${BED_API}/${id}/status`, {
      status,
      notes
    });
    return response.data;
  },

  /**
   * Get available beds for admission
   */
  getAvailableBeds: async (wardId?: string, bedType?: string): Promise<Bed[]> => {
    const response = await apiClient.get(`${BED_API}/available`, {
      params: { wardId, bedType }
    });
    return response.data;
  },

  /**
   * Assign bed to patient
   */
  assignBed: async (bedId: string, admissionId: string): Promise<Bed> => {
    const response = await apiClient.post(`${BED_API}/${bedId}/assign`, {
      admissionId
    });
    return response.data;
  },

  /**
   * Release bed from patient
   */
  releaseBed: async (bedId: string): Promise<Bed> => {
    const response = await apiClient.post(`${BED_API}/${bedId}/release`);
    return response.data;
  },

  /**
   * Delete bed (soft delete)
   */
  deleteBed: async (id: string): Promise<void> => {
    await apiClient.delete(`${BED_API}/${id}`);
  },

  // ==================== ADMISSION OPERATIONS ====================

  /**
   * Get all admissions with pagination and filters
   */
  getAdmissions: async (
    page: number = 0,
    size: number = 20,
    filters?: AdmissionFilters
  ): Promise<PagedResponse<Admission>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(filters as any)
    });
    const response = await apiClient.get(`${ADMISSION_API}?${params}`);
    return response.data;
  },

  /**
   * Get admission by ID
   */
  getAdmissionById: async (id: string): Promise<Admission> => {
    const response = await apiClient.get(`${ADMISSION_API}/${id}`);
    return response.data;
  },

  /**
   * Get admission by admission number
   */
  getAdmissionByNumber: async (admissionNumber: string): Promise<Admission> => {
    const response = await apiClient.get(`${ADMISSION_API}/number/${admissionNumber}`);
    return response.data;
  },

  /**
   * Get patient's admission history
   */
  getPatientAdmissions: async (patientId: string): Promise<Admission[]> => {
    const response = await apiClient.get(`${ADMISSION_API}/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get current active admissions
   */
  getActiveAdmissions: async (wardId?: string): Promise<Admission[]> => {
    const response = await apiClient.get(`${ADMISSION_API}/active`, {
      params: { wardId }
    });
    return response.data;
  },

  /**
   * Create new admission
   */
  createAdmission: async (admissionData: CreateAdmissionRequest): Promise<Admission> => {
    const response = await apiClient.post(ADMISSION_API, admissionData);
    return response.data;
  },

  /**
   * Update admission details
   */
  updateAdmission: async (id: string, admissionData: UpdateAdmissionRequest): Promise<Admission> => {
    const response = await apiClient.put(`${ADMISSION_API}/${id}`, admissionData);
    return response.data;
  },

  /**
   * Discharge patient
   */
  dischargePatient: async (admissionId: string, dischargeData: DischargeRequest): Promise<Admission> => {
    const response = await apiClient.post(`${ADMISSION_API}/${admissionId}/discharge`, dischargeData);
    return response.data;
  },

  /**
   * Transfer patient to another ward/bed
   */
  transferPatient: async (admissionId: string, transferData: TransferRequest): Promise<Admission> => {
    const response = await apiClient.post(`${ADMISSION_API}/${admissionId}/transfer`, transferData);
    return response.data;
  },

  /**
   * Cancel admission (if not yet admitted)
   */
  cancelAdmission: async (admissionId: string, reason: string): Promise<void> => {
    await apiClient.post(`${ADMISSION_API}/${admissionId}/cancel`, { reason });
  },

  /**
   * Get admission vitals history
   */
  getAdmissionVitals: async (admissionId: string): Promise<any[]> => {
    const response = await apiClient.get(`${ADMISSION_API}/${admissionId}/vitals`);
    return response.data;
  },

  /**
   * Add vitals to admission
   */
  addAdmissionVitals: async (admissionId: string, vitalsData: {
    recordedAt: string;
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    respiratoryRate?: number;
    spo2?: number;
    notes?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`${ADMISSION_API}/${admissionId}/vitals`, vitalsData);
    return response.data;
  },

  // ==================== IPD BILLING ====================

  /**
   * Get IPD billing details
   */
  getIPDBilling: async (admissionId: string): Promise<IPDBilling> => {
    const response = await apiClient.get(`${ADMISSION_API}/${admissionId}/billing`);
    return response.data;
  },

  /**
   * Generate IPD bill
   */
  generateIPDBill: async (admissionId: string): Promise<IPDBilling> => {
    const response = await apiClient.post(`${ADMISSION_API}/${admissionId}/generate-bill`);
    return response.data;
  },

  /**
   * Add charges to IPD bill
   */
  addIPDCharges: async (admissionId: string, chargesData: {
    chargeType: string; // CONSULTATION, PROCEDURE, INVESTIGATION, MEDICATION, OTHER
    description: string;
    amount: number;
    quantity?: number;
    date?: string;
    notes?: string;
  }): Promise<IPDBilling> => {
    const response = await apiClient.post(`${ADMISSION_API}/${admissionId}/add-charges`, chargesData);
    return response.data;
  },

  /**
   * Record advance payment for IPD
   */
  recordAdvancePayment: async (admissionId: string, paymentData: {
    amount: number;
    paymentMode: string;
    transactionReference?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`${ADMISSION_API}/${admissionId}/advance-payment`, paymentData);
    return response.data;
  },

  /**
   * Get admission discharge summary
   */
  getDischargeSummary: async (admissionId: string): Promise<Blob> => {
    const response = await apiClient.get(`${ADMISSION_API}/${admissionId}/discharge-summary`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Print admission card
   */
  printAdmissionCard: async (admissionId: string): Promise<Blob> => {
    const response = await apiClient.get(`${ADMISSION_API}/${admissionId}/admission-card`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get IPD statistics for dashboard
   */
  getIPDStatistics: async (fromDate?: string, toDate?: string): Promise<{
    totalAdmissions: number;
    activeAdmissions: number;
    dischargesThisMonth: number;
    averageLengthOfStay: number;
    occupancyRate: number;
    revenueThisMonth: number;
    departmentWiseBreakdown: Record<string, number>;
    wardWiseOccupancy: Record<string, any>;
  }> => {
    const response = await apiClient.get(`${IPD_API}/statistics`, {
      params: { fromDate, toDate }
    });
    return response.data;
  },

  /**
   * Search admissions by patient name, UHID, or admission number
   */
  searchAdmissions: async (query: string): Promise<Admission[]> => {
    const response = await apiClient.get(`${ADMISSION_API}/search`, {
      params: { query }
    });
    return response.data;
  }
};

export default ipdService;
