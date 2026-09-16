import { NotificationType } from '@/domain/enums/NotificationType';

export interface SendNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  sendAt: Date;
}

export interface NotificationFiltersDTO {
  type?: NotificationType;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}

export interface NotificationResponseDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  sendAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}