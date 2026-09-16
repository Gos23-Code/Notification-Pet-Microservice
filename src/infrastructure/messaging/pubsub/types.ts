import { NotificationType } from '@/domain/enums/NotificationType';

/**
 * Forma mínima que debe tener CUALQUIER mensaje que llegue por Pub/Sub,
 * venga del microservicio que venga (usuario, calendario, médico, etc.).
 * `payload` queda abierto porque cada dominio manda datos distintos
 * (nombre de mascota, fecha de cita, tipo de vacuna...).
 */
export interface DomainEvent<TPayload = Record<string, unknown>> {
  eventType: string;
  userId: string;
  payload?: TPayload;
  occurredAt?: string;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  type: NotificationType;
}

/**
 * Payload que manda el microservicio de CALENDARIO, tanto al crear
 * (mascota o usuario) como al actualizar un evento. `eventType` aquí es
 * la categoría del evento de calendario (ej. 'VET_APPOINTMENT'), no debe
 * confundirse con el `eventType` de nivel superior del DomainEvent que
 * enruta hacia el handler.
 */
export interface CalendarEventPayload {
  petId?: string;
  userId?: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location?: string;
  reminderAt?: string;
  reminderEnabled?: boolean;
}

/**
 * Un handler recibe el evento completo (para poder interpolar datos del
 * payload en el título/mensaje) y devuelve la notificación a enviar.
 * Si devuelve null, el evento se descarta sin generar notificación
 * (por ejemplo, un evento informativo que no le interesa al usuario).
 */
export type EventHandler = (event: DomainEvent) => NotificationTemplate | null;

export type EventRegistry = Record<string, EventHandler>;
