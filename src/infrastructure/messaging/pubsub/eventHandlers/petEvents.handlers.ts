import { NotificationType } from '@/domain/enums/NotificationType';
import { DomainEvent, EventRegistry, NotificationTemplate } from '../types';

/**
 * Eventos que publica el microservicio de MASCOTA (alta, edición, fotos,
 * documentos, roles e invitaciones a colaborar). Cada topic de Pub/Sub
 * corresponde 1:1 a un eventType aquí (ej. topic 'pet-added' ->
 * eventType 'PET_ADDED'), igual que ya pasa con USER_LOGIN/USER_LOGOUT.
 */
function petLabel(event: DomainEvent): string {
  return (
    (event.payload?.name as string) ??
    (event.payload?.petName as string) ??
    (event.payload?.petId as string) ??
    'tu mascota'
  );
}

function buildTemplate(title: string, message: string, type: NotificationType): NotificationTemplate {
  return { title, message, type };
}

export const petEventHandlers: EventRegistry = {
  PET_ADDED: (event) =>
    buildTemplate('🐾 Mascota agregada', `Se agregó a ${petLabel(event)} a tu cuenta.`, NotificationType.GENERAL),

  PET_EDITED: (event) =>
    buildTemplate('✏️ Mascota actualizada', `Se actualizó la información de ${petLabel(event)}.`, NotificationType.GENERAL),

  PET_PHOTO_UPLOADED: (event) =>
    buildTemplate('🖼️ Foto actualizada', `Se actualizó la foto de ${petLabel(event)}.`, NotificationType.GENERAL),

  PET_DOCUMENT_UPLOADED: (event) =>
    buildTemplate('📄 Documento subido', `Se subió un nuevo documento de ${petLabel(event)}.`, NotificationType.GENERAL),

  PET_ROLE_UPDATED: (event) => {
    const role = event.payload?.role as string | undefined;
    return buildTemplate(
      '🔑 Rol actualizado',
      `Tu rol para ${petLabel(event)} fue actualizado${role ? ` a ${role}` : ''}.`,
      NotificationType.SHARED_ACCESS
    );
  },

  PET_INVITATION_SENT: (event) =>
    buildTemplate(
      '✉️ Invitación enviada',
      `Se envió una invitación para colaborar en el cuidado de ${petLabel(event)}.`,
      NotificationType.PET_INVITATION
    ),

  PET_INVITATION_ACCEPTED: (event) =>
    buildTemplate('✅ Invitación aceptada', `Tu invitación para ${petLabel(event)} fue aceptada.`, NotificationType.PET_INVITATION),

  PET_INVITATION_REJECTED: (event) =>
    buildTemplate('❌ Invitación rechazada', `Tu invitación para ${petLabel(event)} fue rechazada.`, NotificationType.PET_INVITATION),

  PET_INVITATION_RESENT: (event) =>
    buildTemplate(
      '🔁 Invitación reenviada',
      `Se reenvió la invitación para colaborar en ${petLabel(event)}.`,
      NotificationType.PET_INVITATION
    ),
};
