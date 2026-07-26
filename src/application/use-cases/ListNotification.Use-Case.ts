import { INotificationRepository, NotificationFilters } from '@/domain/interfaces/INotificationRepository';
import { Notification } from '@/domain/entities/Notification';
import { NotificationFiltersDTO } from '../dtos/NotificationDTO';

export class ListNotificationsUseCase {
  constructor(private repository: INotificationRepository) {}

  async execute(userId: string, filters?: NotificationFiltersDTO): Promise<Notification[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const repositoryFilters: NotificationFilters = {
      type: filters?.type,
      read: filters?.read,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      limit: filters?.limit,
      offset: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0
    };

    return await this.repository.findByUserId(userId, repositoryFilters);
  }
}