import { INotificationRepository } from '@/domain/interfaces/INotificationRepository';
import { Notification } from '@/domain/entities/Notification';
import { SendNotificationDTO } from '../dtos/NotificationDTO';
import { NotificationType } from '@/domain/enums/NotificationType';

export class SendNotificationUseCase {
  constructor(private repository: INotificationRepository) {}

  async execute(data: SendNotificationDTO): Promise<Notification> {
    this.validateData(data);

    const notification = Notification.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      sendAt: data.sendAt
    });

    return await this.repository.create(notification);
  }

  private validateData(data: SendNotificationDTO): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (data.title.length > 255) {
      throw new Error('Title must be less than 255 characters');
    }
    if (!data.message || data.message.trim().length === 0) {
      throw new Error('Message is required');
    }
    if (!data.userId) {
      throw new Error('User ID is required');
    }
    if (!data.type) {
      throw new Error('Notification type is required');
    }
    if (!Object.values(NotificationType).includes(data.type)) {
      throw new Error('Invalid notification type');
    }
    if (!data.sendAt) {
      throw new Error('Send date is required');
    }
    // Margen de 5s: evita falsos positivos cuando sendAt se calcula
    // milisegundos antes de esta validación (p. ej. notificaciones
    // en tiempo real disparadas por eventos de Pub/Sub)
    const GRACE_PERIOD_MS = 5000;
    if (data.sendAt.getTime() < Date.now() - GRACE_PERIOD_MS) {
      throw new Error('Send date cannot be in the past');
    }
  }
}