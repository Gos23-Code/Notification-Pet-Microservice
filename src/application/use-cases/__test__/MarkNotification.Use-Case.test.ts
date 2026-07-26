import { MarkAsReadUseCase } from '../MarkNotification.Use-Case';
import { Notification } from '@/domain/entities/Notification';
import { NotificationType } from '@/domain/enums/NotificationType';

const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  markAsRead: jest.fn(),
};

describe('MarkAsReadUseCase', () => {
  let useCase: MarkAsReadUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new MarkAsReadUseCase(mockRepository);
  });

  const mockNotification = Notification.create({
    userId: 'user-123',
    title: 'Vacunación pendiente',
    message: 'Recordatorio: Milo necesita su vacuna antirrábica',
    type: NotificationType.VACCINE_DUE,
    sendAt: new Date('2026-07-20T10:00:00Z'),
  });

  describe('execute', () => {
    it('should mark notification as read successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);
      mockRepository.markAsRead.mockResolvedValue({
        ...mockNotification,
        read: true,
      });

      const result = await useCase.execute(mockNotification.id, 'user-123');

      expect(mockRepository.findById).toHaveBeenCalledWith(mockNotification.id);
      expect(mockRepository.markAsRead).toHaveBeenCalledWith(mockNotification.id);
      expect(result.read).toBe(true);
    });

    it('should throw error if id is empty', async () => {
      await expect(
        useCase.execute('', 'user-123')
      ).rejects.toThrow('Notification ID is required');

      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should throw error if notification not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', 'user-123')
      ).rejects.toThrow('Notification not found');

      expect(mockRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should throw error if user is not authorized', async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);

      await expect(
        useCase.execute(mockNotification.id, 'wrong-user')
      ).rejects.toThrow('Unauthorized to mark this notification as read');

      expect(mockRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should throw error if notification is already read', async () => {
      const alreadyReadNotification = Notification.create({
        userId: 'user-123',
        title: 'Vacunación pendiente',
        message: 'Recordatorio: Milo necesita su vacuna antirrábica',
        type: NotificationType.VACCINE_DUE,
        sendAt: new Date('2026-07-20T10:00:00Z'),
      });
      alreadyReadNotification.markAsRead();

      mockRepository.findById.mockResolvedValue(alreadyReadNotification);

      await expect(
        useCase.execute(alreadyReadNotification.id, 'user-123')
      ).rejects.toThrow('Notification is already marked as read');

      expect(mockRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should work with different user IDs', async () => {
      const differentUserNotification = Notification.create({
        userId: 'user-456',
        title: 'Otra notificación',
        message: 'Mensaje de otra notificación',
        type: NotificationType.GENERAL,
        sendAt: new Date('2026-07-25T10:00:00Z'),
      });

      mockRepository.findById.mockResolvedValue(differentUserNotification);
      mockRepository.markAsRead.mockResolvedValue({
        ...differentUserNotification,
        read: true,
      });

      const result = await useCase.execute(
        differentUserNotification.id, 
        differentUserNotification.userId
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(differentUserNotification.id);
      expect(mockRepository.markAsRead).toHaveBeenCalledWith(differentUserNotification.id);
      expect(result.read).toBe(true);
    });

    it('should handle userId with empty string', async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);

      await expect(
        useCase.execute(mockNotification.id, '')
      ).rejects.toThrow('Unauthorized to mark this notification as read');

      expect(mockRepository.markAsRead).not.toHaveBeenCalled();
    });
  });
});