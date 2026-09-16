import { INotificationRepository, NotificationFilters } from '@/domain/interfaces/INotificationRepository';
import { Notification } from '@/domain/entities/Notification';
import { NotificationType } from '@/domain/enums/NotificationType';
import { supabase } from './client';

interface SupabaseNotificationResponse {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  read: boolean;
  send_at: string;
  created_at: string;
  updated_at: string;
}

export class NotificationRepository implements INotificationRepository {
  async create(notification: Notification): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        id: notification.id,
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        notification_type: notification.type,
        read: notification.read,
        send_at: notification.sendAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
    
    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding notification: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findByUserId(userId: string, filters?: NotificationFilters): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('send_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('notification_type', filters.type);
    }

    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }

    if (filters?.startDate) {
      query = query.gte('send_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('send_at', filters.endDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }

    // ✅ Fix: Asegurar que data sea siempre un array
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(this.mapToEntity);
  }

  async update(notification: Notification): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        title: notification.title,
        message: notification.message,
        notification_type: notification.type,
        read: notification.read,
        send_at: notification.sendAt.toISOString()
      })
      .eq('id', notification.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating notification: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  private mapToEntity(data: SupabaseNotificationResponse): Notification {
    return new Notification(
      data.id,
      data.user_id,
      data.title,
      data.message,
      data.notification_type,
      data.read,
      new Date(data.send_at),
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}