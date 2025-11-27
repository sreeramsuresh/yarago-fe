import { apiClient } from './api';
import type {
  OptometryExamination,
  DoctorConsultation,
  Prescription,
  Medication
} from '../types';

const OPTOMETRY_API = '/api/v1/optometry';
const CONSULTATION_API = '/api/v1/consultations';
const PRESCRIPTION_API = '/api/v1/prescriptions';

export const consultationService = {
  // Optometry Examination
  createOptometryExam: async (examData: Partial<OptometryExamination>): Promise<OptometryExamination> => {
    const response = await apiClient.post(OPTOMETRY_API, examData);
    return response.data;
  },

  getOptometryExam: async (id: string): Promise<OptometryExamination> => {
    const response = await apiClient.get(`${OPTOMETRY_API}/${id}`);
    return response.data;
  },

  updateOptometryExam: async (id: string, examData: Partial<OptometryExamination>): Promise<OptometryExamination> => {
    const response = await apiClient.put(`${OPTOMETRY_API}/${id}`, examData);
    return response.data;
  },

  completeOptometryExam: async (id: string): Promise<OptometryExamination> => {
    const response = await apiClient.post(`${OPTOMETRY_API}/${id}/complete`);
    return response.data;
  },

  // Doctor Consultation
  createConsultation: async (consultationData: Partial<DoctorConsultation>): Promise<DoctorConsultation> => {
    const response = await apiClient.post(CONSULTATION_API, consultationData);
    return response.data;
  },

  getConsultation: async (id: string): Promise<DoctorConsultation> => {
    const response = await apiClient.get(`${CONSULTATION_API}/${id}`);
    return response.data;
  },

  updateConsultation: async (id: string, consultationData: Partial<DoctorConsultation>): Promise<DoctorConsultation> => {
    const response = await apiClient.put(`${CONSULTATION_API}/${id}`, consultationData);
    return response.data;
  },

  completeConsultation: async (id: string): Promise<DoctorConsultation> => {
    const response = await apiClient.post(`${CONSULTATION_API}/${id}/complete`);
    return response.data;
  },

  // Prescription
  createPrescription: async (prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    const response = await apiClient.post(PRESCRIPTION_API, prescriptionData);
    return response.data;
  },

  getPrescription: async (id: string): Promise<Prescription> => {
    const response = await apiClient.get(`${PRESCRIPTION_API}/${id}`);
    return response.data;
  },

  updatePrescription: async (id: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    const response = await apiClient.put(`${PRESCRIPTION_API}/${id}`, prescriptionData);
    return response.data;
  },

  addMedication: async (prescriptionId: string, medication: Omit<Medication, 'id'>): Promise<Prescription> => {
    const response = await apiClient.post(`${PRESCRIPTION_API}/${prescriptionId}/medications`, medication);
    return response.data;
  }
};

export default consultationService;
