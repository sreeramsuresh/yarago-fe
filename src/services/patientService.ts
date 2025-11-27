import { apiClient } from './api';
import type { Patient, CreatePatientRequest, PatientHistory, PagedResponse } from '../types';

const PATIENT_API = '/api/v1/patients';

export const patientService = {
  /**
   * Create new patient
   */
  createPatient: async (patientData: CreatePatientRequest): Promise<Patient> => {
    const response = await apiClient.post(PATIENT_API, patientData);
    return response.data;
  },

  /**
   * Get all patients with pagination and filters
   */
  getPatients: async (
    page: number = 0,
    size: number = 20,
    filters?: {
      search?: string;
      branchId?: string;
      isActive?: boolean;
    }
  ): Promise<PagedResponse<Patient>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...filters
    });
    const response = await apiClient.get(`${PATIENT_API}?${params}`);
    return response.data;
  },

  /**
   * Get patient by ID
   */
  getPatientById: async (id: string): Promise<Patient> => {
    const response = await apiClient.get(`${PATIENT_API}/${id}`);
    return response.data;
  },

  /**
   * Get patient by UHID
   */
  getPatientByUhid: async (uhid: string): Promise<Patient> => {
    const response = await apiClient.get(`${PATIENT_API}/uhid/${uhid}`);
    return response.data;
  },

  /**
   * Update patient
   */
  updatePatient: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
    const response = await apiClient.put(`${PATIENT_API}/${id}`, patientData);
    return response.data;
  },

  /**
   * Delete patient (soft delete)
   */
  deletePatient: async (id: string): Promise<void> => {
    await apiClient.delete(`${PATIENT_API}/${id}`);
  },

  /**
   * Search patients by name or phone
   */
  searchPatients: async (query: string): Promise<Patient[]> => {
    const response = await apiClient.get(`${PATIENT_API}/search`, {
      params: { query }
    });
    return response.data;
  },

  /**
   * Get patient history
   */
  getPatientHistory: async (patientId: string): Promise<PatientHistory[]> => {
    const response = await apiClient.get(`${PATIENT_API}/${patientId}/history`);
    return response.data;
  },

  /**
   * Add patient history entry
   */
  addPatientHistory: async (
    patientId: string,
    history: Omit<PatientHistory, 'id' | 'patientId'>
  ): Promise<PatientHistory> => {
    const response = await apiClient.post(`${PATIENT_API}/${patientId}/history`, history);
    return response.data;
  },

  /**
   * Convert temporary patient to permanent
   */
  convertToPermanent: async (id: string, additionalData?: Partial<Patient>): Promise<Patient> => {
    const response = await apiClient.post(`${PATIENT_API}/${id}/convert-to-permanent`, additionalData);
    return response.data;
  }
};

export default patientService;
