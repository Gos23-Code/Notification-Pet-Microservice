import { NextRequest, NextResponse } from 'next/server';
import { NotificationRepository } from '@/infrastructure/database/supabase/Notification.Repository';
import { SendNotificationUseCase } from '@/application/use-cases/SendNotification.Use-Case';
import { NotificationType } from '@/domain/enums/NotificationType';
import { NotificationFiltersDTO } from '@/application/dtos/NotificationDTO';
import { ListNotificationsUseCase } from '@/application/use-cases/ListNotification.Use-Case';

const repository = new NotificationRepository();

// ============================================
// POST: Enviar notificación (send)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.message || !body.type || !body.userId || !body.sendAt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, type, userId, sendAt' },
        { status: 400 }
      );
    }

    if (!Object.values(NotificationType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const sendUseCase = new SendNotificationUseCase(repository);
    const notification = await sendUseCase.execute({
      userId: body.userId,
      title: body.title,
      message: body.message,
      type: body.type,
      sendAt: new Date(body.sendAt)
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('required') ? 400 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

// ============================================
// GET: Listar notificaciones por usuario (listByUser)
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const filters: NotificationFiltersDTO = {
      type: searchParams.get('type') as NotificationType | undefined,
      read: searchParams.get('read') === 'true' ? true : searchParams.get('read') === 'false' ? false : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    };

    const listUseCase = new ListNotificationsUseCase(repository);
    const notifications = await listUseCase.execute(userId, filters);

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}