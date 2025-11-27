import { apiClient } from './api';
import type { Bill, BillItem, Payment, ServiceMaster, DailyReportSummary } from '../types';

const BILL_API = '/api/v1/bills';
const PAYMENT_API = '/api/v1/payments';
const SERVICE_API = '/api/v1/services';
const REPORT_API = '/api/v1/reports';

export const billingService = {
  // Bills
  createBill: async (billData: Partial<Bill>): Promise<Bill> => {
    const response = await apiClient.post(BILL_API, billData);
    return response.data;
  },

  getBills: async (filters?: {
    patientId?: string;
    date?: string;
    status?: string;
  }): Promise<Bill[]> => {
    const response = await apiClient.get(BILL_API, { params: filters });
    return response.data;
  },

  getBillById: async (id: string): Promise<Bill> => {
    const response = await apiClient.get(`${BILL_API}/${id}`);
    return response.data;
  },

  addBillItem: async (billId: string, item: Omit<BillItem, 'id'>): Promise<Bill> => {
    const response = await apiClient.post(`${BILL_API}/${billId}/items`, item);
    return response.data;
  },

  removeBillItem: async (billId: string, itemId: string): Promise<Bill> => {
    const response = await apiClient.delete(`${BILL_API}/${billId}/items/${itemId}`);
    return response.data;
  },

  getInvoice: async (billId: string): Promise<Blob> => {
    const response = await apiClient.get(`${BILL_API}/${billId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Payments
  recordPayment: async (paymentData: Partial<Payment>): Promise<Payment> => {
    const response = await apiClient.post(PAYMENT_API, paymentData);
    return response.data;
  },

  getPayments: async (billId: string): Promise<Payment[]> => {
    const response = await apiClient.get(`${PAYMENT_API}/bill/${billId}`);
    return response.data;
  },

  // Service Master
  getServices: async (): Promise<ServiceMaster[]> => {
    const response = await apiClient.get(SERVICE_API);
    return response.data;
  },

  // Reports
  getDailyReport: async (date: string): Promise<DailyReportSummary> => {
    const response = await apiClient.get(`${REPORT_API}/daily`, {
      params: { date }
    });
    return response.data;
  }
};

export default billingService;
