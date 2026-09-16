import { Notification } from '../entities/Notification';
import { NotificationType } from '../enums/NotificationType';

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, filters?: NotificationFilters): Promise<Notification[]>;
  update(notification: Notification): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
}

export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}