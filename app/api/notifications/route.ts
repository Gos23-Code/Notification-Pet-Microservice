import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/infrastructure/database/supabase/client';
import { NotificationRepository } from '@/infrastructure/database/supabase/Notification.Repository';
import { SendNotificationUseCase } from '@/application/use-cases/SendNotification.Use-Case';
import { NotificationType } from '@/domain/enums/NotificationType';
import { NotificationFiltersDTO } from '@/application/dtos/NotificationDTO';

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

