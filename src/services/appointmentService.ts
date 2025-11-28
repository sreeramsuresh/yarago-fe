import { apiClient } from './api';
import type {
  Appointment,
  CreateAppointmentRequest,
  Consultant,
  Department,
  PagedResponse
} from '../types';

const APPOINTMENT_API = '/api/v1/appointments';
const CONSULTANT_API = '/api/v1/consultants';
const DEPARTMENT_API = '/api/v1/departments';

export interface AppointmentRequest {
  patientId: number;
  consultantId?: number;
  departmentId?: number;
  appointmentDate: string;
  appointmentTime?: string;
  appointmentType: 'NEW' | 'FOLLOWUP' | 'EMERGENCY' | 'ROUTINE';
  notes?: string;
  isEmergency?: boolean;
}

export interface AppointmentResponse {
  id: number;
  token: string;
  patientId: number;
  consultantId?: number;
  departmentId?: number;
  appointmentDate: string;
  appointmentTime?: string;
  appointmentType: string;
  status: string;
  checkInTime?: string;
  optometryStartTime?: string;
  optometryEndTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  checkoutTime?: string;
  notes?: string;
  isEmergency: boolean;
}

export const appointmentService = {
  // Create new appointment
  createAppointment: async (appointment: AppointmentRequest): Promise<AppointmentResponse> => {
    const response = await apiClient.post<AppointmentResponse>(APPOINTMENT_API, appointment);
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id: number): Promise<AppointmentResponse> => {
    const response = await apiClient.get<AppointmentResponse>(`${APPOINTMENT_API}/${id}`);
    return response.data;
  },

  // Get appointments by date
  getAppointmentsByDate: async (date: string): Promise<AppointmentResponse[]> => {
    const response = await apiClient.get(`${APPOINTMENT_API}/date/${date}`);
    // API returns {success, data: {content: [...]}}
    return response.data?.data?.content || [];
  },

  // Get appointments by patient
  getAppointmentsByPatient: async (patientId: number): Promise<AppointmentResponse[]> => {
    const response = await apiClient.get<AppointmentResponse[]>(`${APPOINTMENT_API}/patient/${patientId}`);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (id: number, status: string): Promise<AppointmentResponse> => {
    const response = await apiClient.patch<AppointmentResponse>(`${APPOINTMENT_API}/${id}/status`, { status });
    return response.data;
  },

  // Get today's queue
  getTodayQueue: async (): Promise<AppointmentResponse[]> => {
    const today = new Date().toISOString().split('T')[0];
    return appointmentService.getAppointmentsByDate(today);
  },
};

export default appointmentService;
