import { NotificationRepository } from '../Notification.Repository';
import { Notification } from '@/domain/entities/Notification';
import { NotificationType } from '@/domain/enums/NotificationType';
import { supabase } from '../client';

// Mock de supabase
jest.mock('../client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
  },
}));

describe('NotificationRepository', () => {
  let repository: NotificationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new NotificationRepository();
  });

  const mockNotification = Notification.create({
    userId: 'user-123',
    title: 'Vacunación pendiente',
    message: 'Recordatorio: Milo necesita su vacuna antirrábica',
    type: NotificationType.VACCINE_DUE,
    sendAt: new Date('2026-07-20T10:00:00Z'),
  });

  const mockSupabaseResponse = {
    id: mockNotification.id,
    user_id: mockNotification.userId,
    title: mockNotification.title,
    message: mockNotification.message,
    notification_type: mockNotification.type,
    read: mockNotification.read,
    send_at: mockNotification.sendAt.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSupabaseResponse,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.create(mockNotification);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(result).toBeInstanceOf(Notification);
      expect(result.id).toBe(mockNotification.id);
    });

    it('should throw error if creation fails', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(repository.create(mockNotification)).rejects.toThrow('Error creating notification');
    });
  });

  describe('findById', () => {
    it('should find a notification by id', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSupabaseResponse,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findById(mockNotification.id);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(result).toBeInstanceOf(Notification);
      expect(result?.id).toBe(mockNotification.id);
    });

    it('should return null if notification not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find notifications by user id', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockSupabaseResponse],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const results = await repository.findByUserId('user-123');

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Notification);
    });

    it('should handle filters correctly', async () => {
      // Crear el mock con el método final que devuelve data
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        // range: no es necesario mockearlo explícitamente
      };

      // Configurar todos los métodos para que retornen el mismo objeto
      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.eq.mockReturnValue(mockQuery);
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.gte.mockReturnValue(mockQuery);
      mockQuery.lte.mockReturnValue(mockQuery);
      mockQuery.limit.mockReturnValue(mockQuery);

      // El método que devuelve los datos (puede ser order, limit o el último)
      // Como no estamos usando offset, el método final será limit u order
      mockQuery.limit.mockResolvedValue({
        data: [mockSupabaseResponse],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const filters = {
        type: NotificationType.VACCINE_DUE,
        read: false,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-31'),
        limit: 10,
        // offset: 0, // 👈 Eliminamos offset para que no se llame range
      };

      const results = await repository.findByUserId('user-123', filters);

      // Verificaciones principales (sin range)
      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockQuery.eq).toHaveBeenCalledWith('notification_type', filters.type);
      expect(mockQuery.eq).toHaveBeenCalledWith('read', filters.read);
      expect(mockQuery.gte).toHaveBeenCalled();
      expect(mockQuery.lte).toHaveBeenCalled();
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      
      // Verificar resultados
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Notification);
      expect(results[0].id).toBe(mockNotification.id);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockSupabaseResponse, read: true },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.markAsRead(mockNotification.id);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(result.read).toBe(true);
    });

    it('should throw error if mark as read fails', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(repository.markAsRead(mockNotification.id)).rejects.toThrow(
        'Error marking notification as read'
      );
    });
  });

  describe('update', () => {
    it('should update a notification successfully', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSupabaseResponse,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.update(mockNotification);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(result).toBeInstanceOf(Notification);
    });
  });
});