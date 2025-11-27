import { apiClient } from './api';
import type { Notification, NotificationRequest, NotificationTemplate } from '../types';

const NOTIFICATION_API = '/api/v1/notifications';
const TEMPLATE_API = '/api/v1/templates';

export const notificationService = {
  // Notifications
  sendNotification: async (notificationData: NotificationRequest): Promise<Notification> => {
    const response = await apiClient.post(`${NOTIFICATION_API}/send`, notificationData);
    return response.data;
  },

  getNotifications: async (recipientId: string): Promise<Notification[]> => {
    const response = await apiClient.get(`${NOTIFICATION_API}/recipient/${recipientId}`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch(`${NOTIFICATION_API}/${id}/read`);
    return response.data;
  },

  getUnreadCount: async (recipientId: string): Promise<number> => {
    const response = await apiClient.get(`${NOTIFICATION_API}/recipient/${recipientId}/unread-count`);
    return response.data;
  },

  // Templates
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get(TEMPLATE_API);
    return response.data;
  },

  getTemplateByCode: async (code: string): Promise<NotificationTemplate> => {
    const response = await apiClient.get(`${TEMPLATE_API}/${code}`);
    return response.data;
  }
};

export default notificationService;
