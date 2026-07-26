import { NextRequest, NextResponse } from 'next/server';
import { NotificationRepository } from '@/infrastructure/database/supabase/Notification.Repository';
import { MarkAsReadUseCase } from '@/application/use-cases/MarkNotification.Use-Case';

const repository = new NotificationRepository();

// ============================================
// PATCH: Marcar notificación como leída (markAsRead)
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const userId = body.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const markAsReadUseCase = new MarkAsReadUseCase(repository);
    const notification = await markAsReadUseCase.execute(id, userId);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = 
      errorMessage.includes('required') ? 400 :
      errorMessage.includes('not found') ? 404 :
      errorMessage.includes('Unauthorized') ? 403 : 500;
    
    return NextResponse.json({ error: errorMessage }, { status });
  }
}