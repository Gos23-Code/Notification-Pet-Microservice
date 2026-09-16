import { NotificationType } from '@/domain/enums/NotificationType';
import { CalendarEventPayload, DomainEvent, EventRegistry, NotificationTemplate } from '../types';

/**
 * Eventos que publica el microservicio de CALENDARIO. Ese servicio solo
 * expone las operaciones relevantes para nosotros:
 *  - crear evento (POST separado para mascota y para usuario)
 *  - actualizar evento (un único PUT por id de evento, sirve para ambos)
 *  - recordatorio de evento (basado en reminderAt, sirve para ambos)
 *
 * El notification_type va fijo en GENERAL: el constraint de la tabla
 * `notifications` en producción no incluye 'APPOINTMENT' (solo GENERAL,
 * PET_INVITATION, SHARED_ACCESS, MEDICAL, VACCINE_DUE, VETERINARY_ALERT),
 * así que cualquier categoría de calendario (payload.eventType, ej.
 * 'VET_APPOINTMENT') cae en GENERAL en vez de arriesgar un valor no
 * permitido por la base de datos.
 */
// Agrega "— 📍 <lugar>" al mensaje cuando el evento trae ubicación
function withLocation(message: string, payload: CalendarEventPayload): string {
  // TODO(debug): quitar este log una vez confirmado el nombre real del campo
  console.log('[calendarEvents] payload recibido:', payload);
  return payload.location ? `${message} — 📍 ${payload.location}` : message;
}

function buildPetCreatedTemplate(event: DomainEvent): NotificationTemplate | null {
  const payload = event.payload as CalendarEventPayload | undefined;
  if (!payload?.title) return null;

  return {
    title: `📅 Evento agregado al calendario de mascota (${payload.petId})`,
    message: withLocation(`Cita control de ${payload.petId}: ${payload.title}`, payload),
    type: NotificationType.GENERAL,
  };
}

function buildUserCreatedTemplate(event: DomainEvent): NotificationTemplate | null {
  const payload = event.payload as CalendarEventPayload | undefined;
  if (!payload?.title) return null;

  return {
    title: `📅 Evento agregado al calendario de usuario (${payload.userId})`,
    message: withLocation(`Cita control de ${payload.userId}: ${payload.title}`, payload),
    type: NotificationType.GENERAL,
  };
}

function buildUpdatedTemplate(event: DomainEvent): NotificationTemplate | null {
  const payload = event.payload as CalendarEventPayload | undefined;
  if (!payload?.title) return null;

  const ownerId = payload.petId ?? payload.userId;

  return {
    title: '📅 Evento del calendario actualizado',
    message: withLocation(`Cita control de ${ownerId}: ${payload.title}`, payload),
    type: NotificationType.GENERAL,
  };
}

function buildReminderTemplate(event: DomainEvent): NotificationTemplate | null {
  const payload = event.payload as CalendarEventPayload | undefined;
  if (!payload?.title) return null;

  const ownerId = payload.petId ?? payload.userId;

  return {
    title: '⏰ Recordatorio de tu calendario',
    message: withLocation(`Cita control de ${ownerId}: ${payload.title}`, payload),
    type: NotificationType.GENERAL,
  };
}

export const calendarEventHandlers: EventRegistry = {
  CALENDAR_PET_CREATED: buildPetCreatedTemplate,
  CALENDAR_USER_CREATED: buildUserCreatedTemplate,
  CALENDAR_EVENT_UPDATED: buildUpdatedTemplate,
  CALENDAR_EVENT_REMINDER: buildReminderTemplate,
};
