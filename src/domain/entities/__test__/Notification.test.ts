import { Notification } from '../Notification';
import { NotificationType } from '../../enums/NotificationType';

describe('Notification Entity', () => {
  const mockProps = {
    userId: 'user-123',
    title: 'Vacunación pendiente',
    message: 'Recordatorio: Milo necesita su vacuna antirrábica',
    type: NotificationType.VACCINE_DUE,
    sendAt: new Date('2026-07-20T10:00:00Z'),
  };

  describe('create', () => {
    it('should create a new notification with generated ID', () => {
      const notification = Notification.create(mockProps);

      expect(notification).toBeInstanceOf(Notification);
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(mockProps.userId);
      expect(notification.title).toBe(mockProps.title);
      expect(notification.message).toBe(mockProps.message);
      expect(notification.type).toBe(mockProps.type);
      expect(notification.sendAt).toBe(mockProps.sendAt);
      expect(notification.read).toBe(false);
    });

    it('should create notification with read = false by default', () => {
      const notification = Notification.create(mockProps);
      expect(notification.read).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = Notification.create(mockProps);
      expect(notification.read).toBe(false);

      notification.markAsRead();

      expect(notification.read).toBe(true);
      expect(notification.updatedAt).toBeDefined();
    });

    it('should keep read = true if already read', () => {
      const notification = Notification.create(mockProps);
      notification.markAsRead();
      expect(notification.read).toBe(true);

      const updatedAt = notification.updatedAt;
      notification.markAsRead();

      expect(notification.read).toBe(true);
      expect(notification.updatedAt).not.toBe(updatedAt);
    });
  });
});