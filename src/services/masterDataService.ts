import { apiClient } from './api';

const MASTER_DATA_API = '/api/v1/master-data';
const CHIEF_COMPLAINT_API = '/api/v1/chief-complaints';
const MEDICAL_HISTORY_API = '/api/v1/medical-history';
const DIAGNOSIS_API = '/api/v1/diagnosis';
const DRUG_API = '/api/v1/drugs';
const CLINICAL_FINDINGS_API = '/api/v1/clinical-findings';
const ADVICE_API = '/api/v1/advice-templates';
const ICD_API = '/api/v1/icd-codes';

// ==================== MASTER DATA TYPES ====================

export interface ChiefComplaint {
  id: string;
  complaintCode: string;
  complaintName: string;
  category: string; // VISION, PAIN, DISCHARGE, INJURY, COSMETIC, ROUTINE
  description?: string;
  commonDuration?: string[];
  relatedSymptoms?: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryOption {
  id: string;
  historyCode: string;
  historyName: string;
  category: string; // SYSTEMIC, OCULAR, SURGICAL, ALLERGIES, FAMILY, SOCIAL
  subcategory?: string;
  description?: string;
  commonValues?: string[];
  requiresDetail: boolean; // If true, user must provide additional details
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisCode {
  id: string;
  diagnosisCode: string; // ICD-10 code
  diagnosisName: string;
  category: string; // REFRACTIVE_ERROR, CATARACT, GLAUCOMA, RETINAL, CORNEAL, etc.
  subcategory?: string;
  icdVersion: string; // ICD-10, ICD-11
  description?: string;
  synonyms?: string[];
  relatedCodes?: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Drug {
  id: string;
  drugCode: string;
  drugName: string;
  genericName: string;
  brandName?: string;
  manufacturer?: string;
  category: string; // ANTIBIOTIC, ANTI_INFLAMMATORY, LUBRICANT, ANTIGLAUCOMA, etc.
  drugType: string; // EYE_DROPS, TABLET, CAPSULE, OINTMENT, INJECTION
  strength: string;
  unit: string; // mg, ml, %
  packaging: string; // 5ml bottle, 10 tablets, etc.
  administration: string; // ORAL, TOPICAL, INTRAVENOUS, INTRAMUSCULAR
  commonDosages?: string[];
  commonFrequencies?: string[];
  commonDurations?: string[];
  defaultInstructions?: string;
  precautions?: string[];
  sideEffects?: string[];
  contraindications?: string[];
  pricePerUnit?: number;
  isActive: boolean;
  requiresPrescription: boolean;
  isControlled: boolean; // For controlled substances
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalFinding {
  id: string;
  findingCode: string;
  findingName: string;
  category: string; // ANTERIOR_SEGMENT, POSTERIOR_SEGMENT, VISION, IOP, FUNDUS, etc.
  subcategory?: string;
  eye: string; // BOTH, RIGHT, LEFT, NA
  description?: string;
  normalRange?: string;
  abnormalIndicators?: string[];
  relatedFindings?: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdviceTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  category: string; // POST_OPERATIVE, GENERAL, EMERGENCY, PREVENTIVE
  condition?: string; // Related diagnosis or condition
  adviceText: string;
  instructions: string[];
  dosList: string[];
  dontsList: string[];
  followUpGuidelines?: string;
  emergencySigns?: string[];
  applicableFor?: string[]; // Patient age groups or conditions
  isActive: boolean;
  sortOrder: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICDCode {
  id: string;
  icdCode: string; // Full ICD code (e.g., H52.1)
  version: string; // ICD-10, ICD-11
  chapter: string;
  section: string;
  category: string;
  title: string;
  description?: string;
  inclusionTerms?: string[];
  exclusionTerms?: string[];
  notes?: string[];
  parentCode?: string;
  isLeaf: boolean; // True if it's the most specific level
  isActive: boolean;
}

export interface MasterDataCategory {
  category: string;
  displayName: string;
  description?: string;
  itemCount: number;
}

export interface CreateChiefComplaintRequest {
  complaintCode: string;
  complaintName: string;
  category: string;
  description?: string;
  commonDuration?: string[];
  relatedSymptoms?: string[];
  sortOrder?: number;
}

export interface CreateMedicalHistoryRequest {
  historyCode: string;
  historyName: string;
  category: string;
  subcategory?: string;
  description?: string;
  commonValues?: string[];
  requiresDetail?: boolean;
  sortOrder?: number;
}

export interface CreateDiagnosisRequest {
  diagnosisCode: string;
  diagnosisName: string;
  category: string;
  subcategory?: string;
  icdVersion: string;
  description?: string;
  synonyms?: string[];
  relatedCodes?: string[];
  sortOrder?: number;
}

export interface CreateDrugRequest {
  drugCode: string;
  drugName: string;
  genericName: string;
  brandName?: string;
  manufacturer?: string;
  category: string;
  drugType: string;
  strength: string;
  unit: string;
  packaging: string;
  administration: string;
  commonDosages?: string[];
  commonFrequencies?: string[];
  commonDurations?: string[];
  defaultInstructions?: string;
  precautions?: string[];
  sideEffects?: string[];
  contraindications?: string[];
  pricePerUnit?: number;
  requiresPrescription?: boolean;
  isControlled?: boolean;
  sortOrder?: number;
}

export interface CreateClinicalFindingRequest {
  findingCode: string;
  findingName: string;
  category: string;
  subcategory?: string;
  eye: string;
  description?: string;
  normalRange?: string;
  abnormalIndicators?: string[];
  relatedFindings?: string[];
  sortOrder?: number;
}

export interface CreateAdviceTemplateRequest {
  templateCode: string;
  templateName: string;
  category: string;
  condition?: string;
  adviceText: string;
  instructions: string[];
  dosList: string[];
  dontsList: string[];
  followUpGuidelines?: string;
  emergencySigns?: string[];
  applicableFor?: string[];
  sortOrder?: number;
}

// ==================== MASTER DATA SERVICE ====================
export const masterDataService = {
  // ==================== CHIEF COMPLAINTS ====================

  /**
   * Get all chief complaints
   */
  getChiefComplaints: async (category?: string, isActive: boolean = true): Promise<ChiefComplaint[]> => {
    const response = await apiClient.get(CHIEF_COMPLAINT_API, {
      params: { category, isActive }
    });
    return response.data;
  },

  /**
   * Get chief complaint by ID
   */
  getChiefComplaintById: async (id: string): Promise<ChiefComplaint> => {
    const response = await apiClient.get(`${CHIEF_COMPLAINT_API}/${id}`);
    return response.data;
  },

  /**
   * Search chief complaints
   */
  searchChiefComplaints: async (query: string): Promise<ChiefComplaint[]> => {
    const response = await apiClient.get(`${CHIEF_COMPLAINT_API}/search`, {
      params: { query }
    });
    return response.data;
  },

  /**
   * Create chief complaint
   */
  createChiefComplaint: async (data: CreateChiefComplaintRequest): Promise<ChiefComplaint> => {
    const response = await apiClient.post(CHIEF_COMPLAINT_API, data);
    return response.data;
  },

  /**
   * Update chief complaint
   */
  updateChiefComplaint: async (id: string, data: Partial<ChiefComplaint>): Promise<ChiefComplaint> => {
    const response = await apiClient.put(`${CHIEF_COMPLAINT_API}/${id}`, data);
    return response.data;
  },

  /**
   * Delete chief complaint (soft delete)
   */
  deleteChiefComplaint: async (id: string): Promise<void> => {
    await apiClient.delete(`${CHIEF_COMPLAINT_API}/${id}`);
  },

  /**
   * Get chief complaint categories
   */
  getChiefComplaintCategories: async (): Promise<string[]> => {
    const response = await apiClient.get(`${CHIEF_COMPLAINT_API}/categories`);
    return response.data;
  },

  // ==================== MEDICAL HISTORY OPTIONS ====================

  /**
   * Get all medical history options
   */
  getMedicalHistoryOptions: async (category?: string, isActive: boolean = true): Promise<MedicalHistoryOption[]> => {
    const response = await apiClient.get(MEDICAL_HISTORY_API, {
      params: { category, isActive }
    });
    return response.data;
  },

  /**
   * Get medical history option by ID
   */
  getMedicalHistoryOptionById: async (id: string): Promise<MedicalHistoryOption> => {
    const response = await apiClient.get(`${MEDICAL_HISTORY_API}/${id}`);
    return response.data;
  },

  /**
   * Search medical history options
   */
  searchMedicalHistory: async (query: string): Promise<MedicalHistoryOption[]> => {
    const response = await apiClient.get(`${MEDICAL_HISTORY_API}/search`, {
      params: { query }
    });
    return response.data;
  },

  /**
   * Create medical history option
   */
  createMedicalHistory: async (data: CreateMedicalHistoryRequest): Promise<MedicalHistoryOption> => {
    const response = await apiClient.post(MEDICAL_HISTORY_API, data);
    return response.data;
  },

  /**
   * Update medical history option
   */
  updateMedicalHistory: async (id: string, data: Partial<MedicalHistoryOption>): Promise<MedicalHistoryOption> => {
    const response = await apiClient.put(`${MEDICAL_HISTORY_API}/${id}`, data);
    return response.data;
  },

  /**
   * Delete medical history option (soft delete)
   */
  deleteMedicalHistory: async (id: string): Promise<void> => {
    await apiClient.delete(`${MEDICAL_HISTORY_API}/${id}`);
  },

  /**
   * Get medical history categories
   */
  getMedicalHistoryCategories: async (): Promise<Record<string, MedicalHistoryOption[]>> => {
    const response = await apiClient.get(`${MEDICAL_HISTORY_API}/categories`);
    return response.data;
  },

  // ==================== DIAGNOSIS CODES ====================

  /**
   * Get all diagnosis codes
   */
  getDiagnosisCodes: async (
    category?: string,
    search?: string,
    isActive: boolean = true
  ): Promise<DiagnosisCode[]> => {
    const response = await apiClient.get(DIAGNOSIS_API, {
      params: { category, search, isActive }
    });
    return response.data;
  },

  /**
   * Get diagnosis code by ID
   */
  getDiagnosisCodeById: async (id: string): Promise<DiagnosisCode> => {
    const response = await apiClient.get(`${DIAGNOSIS_API}/${id}`);
    return response.data;
  },

  /**
   * Search diagnosis codes with autocomplete
   */
  searchDiagnosisCodes: async (query: string, limit: number = 20): Promise<DiagnosisCode[]> => {
    const response = await apiClient.get(`${DIAGNOSIS_API}/search`, {
      params: { query, limit }
    });
    return response.data;
  },

  /**
   * Create diagnosis code
   */
  createDiagnosisCode: async (data: CreateDiagnosisRequest): Promise<DiagnosisCode> => {
    const response = await apiClient.post(DIAGNOSIS_API, data);
    return response.data;
  },

  /**
   * Update diagnosis code
   */
  updateDiagnosisCode: async (id: string, data: Partial<DiagnosisCode>): Promise<DiagnosisCode> => {
    const response = await apiClient.put(`${DIAGNOSIS_API}/${id}`, data);
    return response.data;
  },

  /**
   * Delete diagnosis code (soft delete)
   */
  deleteDiagnosisCode: async (id: string): Promise<void> => {
    await apiClient.delete(`${DIAGNOSIS_API}/${id}`);
  },

  /**
   * Get diagnosis categories
   */
  getDiagnosisCategories: async (): Promise<string[]> => {
    const response = await apiClient.get(`${DIAGNOSIS_API}/categories`);
    return response.data;
  },

  /**
   * Get commonly used diagnoses
   */
  getCommonDiagnoses: async (limit: number = 50): Promise<DiagnosisCode[]> => {
    const response = await apiClient.get(`${DIAGNOSIS_API}/common`, {
      params: { limit }
    });
    return response.data;
  },

  // ==================== ICD CODES ====================

  /**
   * Search ICD codes
   */
  searchICDCodes: async (query: string, version?: string, limit: number = 20): Promise<ICDCode[]> => {
    const response = await apiClient.get(`${ICD_API}/search`, {
      params: { query, version, limit }
    });
    return response.data;
  },

  /**
   * Get ICD code by code
   */
  getICDCodeByCode: async (code: string, version: string = 'ICD-10'): Promise<ICDCode> => {
    const response = await apiClient.get(`${ICD_API}/${version}/${code}`);
    return response.data;
  },

  /**
   * Get ICD codes by chapter
   */
  getICDCodesByChapter: async (chapter: string, version: string = 'ICD-10'): Promise<ICDCode[]> => {
    const response = await apiClient.get(`${ICD_API}/${version}/chapter/${chapter}`);
    return response.data;
  },

  /**
   * Get ICD code hierarchy (parent-child relationship)
   */
  getICDCodeHierarchy: async (code: string, version: string = 'ICD-10'): Promise<ICDCode[]> => {
    const response = await apiClient.get(`${ICD_API}/${version}/${code}/hierarchy`);
    return response.data;
  },

  // ==================== DRUGS / MEDICATIONS ====================

  /**
   * Get all drugs
   */
  getDrugs: async (
    category?: string,
    drugType?: string,
    search?: string,
    isActive: boolean = true
  ): Promise<Drug[]> => {
    const response = await apiClient.get(DRUG_API, {
      params: { category, drugType, search, isActive }
    });
    return response.data?.data || response.data || [];
  },

  /**
   * Get drug by ID
   */
  getDrugById: async (id: string): Promise<Drug> => {
    const response = await apiClient.get(`${DRUG_API}/${id}`);
    return response.data;
  },

  /**
   * Search drugs with autocomplete
   */
  searchDrugs: async (query: string, category?: string, limit: number = 20): Promise<Drug[]> => {
    const response = await apiClient.get(`${DRUG_API}/search`, {
      params: { query, category, limit }
    });
    return response.data?.data || response.data || [];
  },

  /**
   * Create drug
   */
  createDrug: async (data: CreateDrugRequest): Promise<Drug> => {
    const response = await apiClient.post(DRUG_API, data);
    return response.data;
  },

  /**
   * Update drug
   */
  updateDrug: async (id: string, data: Partial<Drug>): Promise<Drug> => {
    const response = await apiClient.put(`${DRUG_API}/${id}`, data);
    return response.data;
  },

  /**
   * Delete drug (soft delete)
   */
  deleteDrug: async (id: string): Promise<void> => {
    await apiClient.delete(`${DRUG_API}/${id}`);
  },

  /**
   * Get drug categories
   */
  getDrugCategories: async (): Promise<string[]> => {
    const response = await apiClient.get(`${DRUG_API}/categories`);
    return response.data?.data || response.data || [];
  },

  /**
   * Get commonly prescribed drugs
   */
  getCommonDrugs: async (category?: string, limit: number = 50): Promise<Drug[]> => {
    const response = await apiClient.get(`${DRUG_API}/common`, {
      params: { category, limit }
    });
    return response.data?.data || response.data || [];
  },

  /**
   * Get drug interactions (if available)
   */
  getDrugInteractions: async (drugIds: string[]): Promise<{
    interactions: Array<{
      drug1: string;
      drug2: string;
      severity: string;
      description: string;
    }>;
  }> => {
    const response = await apiClient.post(`${DRUG_API}/interactions`, {
      drugIds
    });
    return response.data;
  },

  // ==================== CLINICAL FINDINGS ====================

  /**
   * Get all clinical findings
   */
  getClinicalFindings: async (
    category?: string,
    subcategory?: string,
    isActive: boolean = true
  ): Promise<ClinicalFinding[]> => {
    const response = await apiClient.get(CLINICAL_FINDINGS_API, {
      params: { category, subcategory, isActive }
    });
    return response.data;
  },

  /**
   * Get clinical finding by ID
   */
  getClinicalFindingById: async (id: string): Promise<ClinicalFinding> => {
    const response = await apiClient.get(`${CLINICAL_FINDINGS_API}/${id}`);
    return response.data;
  },

  /**
   * Search clinical findings
   */
  searchClinicalFindings: async (query: string, category?: string): Promise<ClinicalFinding[]> => {
    const response = await apiClient.get(`${CLINICAL_FINDINGS_API}/search`, {
      params: { query, category }
    });
    return response.data;
  },

  /**
   * Create clinical finding
   */
  createClinicalFinding: async (data: CreateClinicalFindingRequest): Promise<ClinicalFinding> => {
    const response = await apiClient.post(CLINICAL_FINDINGS_API, data);
    return response.data;
  },

  /**
   * Update clinical finding
   */
  updateClinicalFinding: async (id: string, data: Partial<ClinicalFinding>): Promise<ClinicalFinding> => {
    const response = await apiClient.put(`${CLINICAL_FINDINGS_API}/${id}`, data);
    return response.data;
  },

  /**
   * Delete clinical finding (soft delete)
   */
  deleteClinicalFinding: async (id: string): Promise<void> => {
    await apiClient.delete(`${CLINICAL_FINDINGS_API}/${id}`);
  },

  /**
   * Get clinical findings grouped by category
   */
  getClinicalFindingsByCategory: async (): Promise<Record<string, ClinicalFinding[]>> => {
    const response = await apiClient.get(`${CLINICAL_FINDINGS_API}/by-category`);
    return response.data;
  },

  // ==================== ADVICE TEMPLATES ====================

  /**
   * Get all advice templates
   */
  getAdviceTemplates: async (
    category?: string,
    condition?: string,
    isActive: boolean = true
  ): Promise<AdviceTemplate[]> => {
    const response = await apiClient.get(ADVICE_API, {
      params: { category, condition, isActive }
    });
    return response.data;
  },

  /**
   * Get advice template by ID
   */
  getAdviceTemplateById: async (id: string): Promise<AdviceTemplate> => {
    const response = await apiClient.get(`${ADVICE_API}/${id}`);
    return response.data;
  },

  /**
   * Search advice templates
   */
  searchAdviceTemplates: async (query: string): Promise<AdviceTemplate[]> => {
    const response = await apiClient.get(`${ADVICE_API}/search`, {
      params: { query }
    });
    return response.data;
  },

  /**
   * Create advice template
   */
  createAdviceTemplate: async (data: CreateAdviceTemplateRequest): Promise<AdviceTemplate> => {
    const response = await apiClient.post(ADVICE_API, data);
    return response.data;
  },

  /**
   * Update advice template
   */
  updateAdviceTemplate: async (id: string, data: Partial<AdviceTemplate>): Promise<AdviceTemplate> => {
    const response = await apiClient.put(`${ADVICE_API}/${id}`, data);
    return response.data;
  },

  /**
   * Delete advice template (soft delete)
   */
  deleteAdviceTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`${ADVICE_API}/${id}`);
  },

  /**
   * Get advice template categories
   */
  getAdviceCategories: async (): Promise<string[]> => {
    const response = await apiClient.get(`${ADVICE_API}/categories`);
    return response.data;
  },

  /**
   * Get commonly used advice templates
   */
  getCommonAdviceTemplates: async (limit: number = 20): Promise<AdviceTemplate[]> => {
    const response = await apiClient.get(`${ADVICE_API}/common`, {
      params: { limit }
    });
    return response.data;
  },

  // ==================== GENERAL MASTER DATA OPERATIONS ====================

  /**
   * Get all master data categories with counts
   */
  getMasterDataCategories: async (): Promise<MasterDataCategory[]> => {
    const response = await apiClient.get(`${MASTER_DATA_API}/categories`);
    return response.data;
  },

  /**
   * Bulk import master data (Excel/CSV)
   */
  importMasterData: async (type: string, file: File): Promise<{
    imported: number;
    failed: number;
    errors?: Array<{
      row: number;
      error: string;
    }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post(`${MASTER_DATA_API}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Export master data to Excel
   */
  exportMasterData: async (type: string): Promise<Blob> => {
    const response = await apiClient.get(`${MASTER_DATA_API}/export/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get master data statistics
   */
  getMasterDataStatistics: async (): Promise<Record<string, {
    total: number;
    active: number;
    inactive: number;
    lastUpdated: string;
  }>> => {
    const response = await apiClient.get(`${MASTER_DATA_API}/statistics`);
    return response.data;
  },

  /**
   * Sync master data from external source (if applicable)
   */
  syncMasterData: async (type: string): Promise<{
    synced: number;
    added: number;
    updated: number;
    timestamp: string;
  }> => {
    const response = await apiClient.post(`${MASTER_DATA_API}/sync/${type}`);
    return response.data;
  },

  /**
   * Create generic master data entry
   */
  createMasterData: async (type: string, data: any): Promise<any> => {
    const response = await apiClient.post(`${MASTER_DATA_API}/${type}`, data);
    return response.data;
  },

  /**
   * Update generic master data entry
   */
  updateMasterData: async (type: string, id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`${MASTER_DATA_API}/${type}/${id}`, data);
    return response.data;
  },

  /**
   * Delete generic master data entry
   */
  deleteMasterData: async (type: string, id: string): Promise<void> => {
    await apiClient.delete(`${MASTER_DATA_API}/${type}/${id}`);
  },

  /**
   * Validate master data integrity
   */
  validateMasterData: async (type?: string): Promise<{
    valid: boolean;
    issues: Array<{
      type: string;
      severity: string;
      description: string;
      affectedItems: number;
    }>;
  }> => {
    const response = await apiClient.post(`${MASTER_DATA_API}/validate`, {
      type
    });
    return response.data;
  }
};

export default masterDataService;
