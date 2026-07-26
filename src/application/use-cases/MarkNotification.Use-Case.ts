import { INotificationRepository } from '@/domain/interfaces/INotificationRepository';
import { Notification } from '@/domain/entities/Notification';

export class MarkAsReadUseCase {
  constructor(private repository: INotificationRepository) {}

  async execute(id: string, userId: string): Promise<Notification> {
    if (!id) {
      throw new Error('Notification ID is required');
    }

    const notification = await this.repository.findById(id);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized to mark this notification as read');
    }

    if (notification.read) {
      throw new Error('Notification is already marked as read');
    }

    return await this.repository.markAsRead(id);
  }
}