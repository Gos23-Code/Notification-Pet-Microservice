import { ListNotificationsUseCase } from '../ListNotification.Use-Case';
import { Notification } from '@/domain/entities/Notification';
import { NotificationType } from '@/domain/enums/NotificationType';
import { NotificationFiltersDTO } from '../../dtos/NotificationDTO';

const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  markAsRead: jest.fn(),
};

describe('ListNotificationsUseCase', () => {
  let useCase: ListNotificationsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListNotificationsUseCase(mockRepository);
  });

  const mockNotifications = [
    Notification.create({
      userId: 'user-123',
      title: 'Notificación 1',
      message: 'Mensaje 1',
      type: NotificationType.VACCINE_DUE,
      sendAt: new Date('2026-07-20T10:00:00Z'),
    }),
    Notification.create({
      userId: 'user-123',
      title: 'Notificación 2',
      message: 'Mensaje 2',
      type: NotificationType.APPOINTMENT,
      sendAt: new Date('2026-07-21T10:00:00Z'),
    }),
  ];

  describe('execute', () => {
    it('should list notifications for a user', async () => {
      mockRepository.findByUserId.mockResolvedValue(mockNotifications);

      const result = await useCase.execute('user-123');

      // El caso de uso pasa un objeto de filtros con valores por defecto
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: undefined,
        read: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
        offset: 0,
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Notification);
    });

    it('should list notifications with filters', async () => {
      const filters: NotificationFiltersDTO = {
        type: NotificationType.VACCINE_DUE,
        read: false,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-31'),
        limit: 10,
        page: 1,
      };

      mockRepository.findByUserId.mockResolvedValue([mockNotifications[0]]);

      const result = await useCase.execute('user-123', filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: filters.type,
        read: filters.read,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit,
        offset: 0,
      });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NotificationType.VACCINE_DUE);
    });

    it('should throw error if userId is missing', async () => {
      await expect(useCase.execute('')).rejects.toThrow('User ID is required');
      expect(mockRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should return empty array if no notifications found', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute('user-123');

      expect(result).toHaveLength(0);
    });

    it('should handle pagination correctly', async () => {
      const filters: NotificationFiltersDTO = {
        limit: 5,
        page: 2,
      };

      mockRepository.findByUserId.mockResolvedValue(mockNotifications);

      await useCase.execute('user-123', filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: undefined,
        read: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: 5,
        offset: 5, // (page - 1) * limit = (2-1) * 5 = 5
      });
    });

    it('should handle read filter correctly', async () => {
      const filters: NotificationFiltersDTO = {
        read: true,
      };

      mockRepository.findByUserId.mockResolvedValue([]);

      await useCase.execute('user-123', filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: undefined,
        read: true,
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
        offset: 0,
      });
    });

    it('should handle date filters correctly', async () => {
      const filters: NotificationFiltersDTO = {
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-31'),
      };

      mockRepository.findByUserId.mockResolvedValue([]);

      await useCase.execute('user-123', filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: undefined,
        read: undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: undefined,
        offset: 0,
      });
    });

    it('should handle type filter correctly', async () => {
      const filters: NotificationFiltersDTO = {
        type: NotificationType.APPOINTMENT,
      };

      mockRepository.findByUserId.mockResolvedValue([mockNotifications[1]]);

      const result = await useCase.execute('user-123', filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: NotificationType.APPOINTMENT,
        read: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
        offset: 0,
      });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NotificationType.APPOINTMENT);
    });

    it('should handle combined filters correctly', async () => {
      const filters: NotificationFiltersDTO = {
        type: NotificationType.VACCINE_DUE,
        read: false,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-31'),
        limit: 10,
        page: 3,
      };

      mockRepository.findByUserId.mockResolvedValue([mockNotifications[0]]);

      await useCase.execute('user-123', filters);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        type: filters.type,
        read: filters.read,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit,
        offset: 20, // (page - 1) * limit = (3-1) * 10 = 20
      });
    });
  });
});