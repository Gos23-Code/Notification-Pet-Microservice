import { SendNotificationUseCase } from '../SendNotification.Use-Case';
import { Notification } from '@/domain/entities/Notification';
import { NotificationType } from '@/domain/enums/NotificationType';
import { SendNotificationDTO } from '../../dtos/NotificationDTO';

const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  markAsRead: jest.fn(),
};

describe('SendNotificationUseCase', () => {
  let useCase: SendNotificationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    useCase = new SendNotificationUseCase(mockRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const validData: SendNotificationDTO = {
    userId: 'user-123',
    title: 'Vacunación pendiente',
    message: 'Recordatorio: Milo necesita su vacuna antirrábica',
    type: NotificationType.VACCINE_DUE,
    sendAt: new Date('2026-07-20T10:00:00Z'),
  };

  describe('execute', () => {
    it('should send a notification successfully', async () => {
      const expectedNotification = Notification.create(validData);
      mockRepository.create.mockResolvedValue(expectedNotification);

      const result = await useCase.execute(validData);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Notification);
      expect(result.userId).toBe(validData.userId);
      expect(result.title).toBe(validData.title);
      expect(result.message).toBe(validData.message);
      expect(result.type).toBe(validData.type);
      expect(result.read).toBe(false);
    });

    it('should throw error if title is empty', async () => {
      const invalidData = { ...validData, title: '' };

      await expect(useCase.execute(invalidData)).rejects.toThrow('Title is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if title exceeds 255 characters', async () => {
      const invalidData = { ...validData, title: 'a'.repeat(256) };

      await expect(useCase.execute(invalidData)).rejects.toThrow('Title must be less than 255 characters');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if message is empty', async () => {
      const invalidData = { ...validData, message: '' };

      await expect(useCase.execute(invalidData)).rejects.toThrow('Message is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if userId is missing', async () => {
      const invalidData = { ...validData, userId: '' };

      await expect(useCase.execute(invalidData)).rejects.toThrow('User ID is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if type is invalid', async () => {
      const invalidData = { ...validData, type: 'INVALID' as NotificationType };

      await expect(useCase.execute(invalidData)).rejects.toThrow('Invalid notification type');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if sendAt is in the past', async () => {
      const invalidData = { 
        ...validData, 
        sendAt: new Date('2023-01-01T10:00:00Z')
      };

      await expect(useCase.execute(invalidData)).rejects.toThrow('Send date cannot be in the past');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle all valid notification types', async () => {
      const types = [
        NotificationType.PET_INVITATION,
        NotificationType.VACCINE_DUE,
        NotificationType.APPOINTMENT,
        NotificationType.MEDICATION,
        NotificationType.SHARED_ACCESS,
        NotificationType.GENERAL,
        NotificationType.REMINDER
      ];

      for (const type of types) {
        const data = { ...validData, type };
        const expectedNotification = Notification.create(data);
        mockRepository.create.mockResolvedValue(expectedNotification);

        const result = await useCase.execute(data);

        expect(result.type).toBe(type);
        expect(mockRepository.create).toHaveBeenCalled();
        mockRepository.create.mockClear();
      }
    });

    it('should throw error if sendAt is missing', async () => {
      const invalidData = { ...validData, sendAt: undefined as unknown as Date };

      await expect(useCase.execute(invalidData)).rejects.toThrow('Send date is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});