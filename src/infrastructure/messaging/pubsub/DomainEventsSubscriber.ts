import type { Message } from '@google-cloud/pubsub';
import { getPubSubClient } from './PubSubClient';
import { SendNotificationUseCase } from '@/application/use-cases/SendNotification.Use-Case';
import { NotificationRepository } from '@/infrastructure/database/supabase/Notification.Repository';
import { eventRegistry } from './eventHandlers';
import { DomainEvent } from './types';

let isListening = false;

/**
 * Arranca (una sola vez por proceso) un listener por cada suscripción
 * indicada en PUBSUB_SUBSCRIPTIONS (separadas por coma). Cada
 * microservicio emisor (usuario, calendario, médico...) tiene su
 * propio topic/suscripción, pero todos terminan en el mismo
 * `eventRegistry`, así que agregar un emisor nuevo es solo:
 *   1. crear la suscripción en GCP
 *   2. agregarla a la variable de entorno
 *   3. crear su archivo de handlers en ./eventHandlers
 */
export function startDomainEventsSubscriber(): void {
  if (isListening) return;

  const subscriptionNames = (process.env.PUBSUB_SUBSCRIPTIONS ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  if (subscriptionNames.length === 0) {
    console.warn('[PubSub] PUBSUB_SUBSCRIPTIONS no está definida — subscriber deshabilitado');
    return;
  }

  isListening = true;

  const sendUseCase = new SendNotificationUseCase(new NotificationRepository());

  for (const subscriptionName of subscriptionNames) {
    const subscription = getPubSubClient().subscription(subscriptionName, {
      flowControl: { maxMessages: 10 },
    });

    subscription.on('message', (message: Message) => {
      void handleMessage(message, sendUseCase, subscriptionName);
    });

    subscription.on('error', (error) => {
      console.error(`[PubSub] Error en la suscripción "${subscriptionName}"`, error);
    });

    console.log(`[PubSub] Escuchando "${subscriptionName}"`);
  }
}

async function handleMessage(
  message: Message,
  sendUseCase: SendNotificationUseCase,
  subscriptionName: string
): Promise<void> {
  try {
    // No todos los microservicios mandan la misma forma de mensaje: calendario
    // envuelve sus datos en `payload` y manda `userId` a nivel superior, pero
    // mascota manda todo plano (petId, ownerId, petName, eventType...) sin
    // envoltorio ni campo `userId`. Normalizamos ambos casos acá:
    //  - payload: el `payload` explícito si existe, si no, el mensaje entero
    //  - userId: `userId` a nivel superior o dentro del payload; si no,
    //    `ownerId` (mismo usuario, otro nombre) a nivel superior o del payload
    const raw = JSON.parse(message.data.toString('utf-8')) as Record<string, unknown>;
    const payload = (raw.payload as Record<string, unknown> | undefined) ?? raw;
    const userId =
      (raw.userId as string | undefined) ??
      (raw.ownerId as string | undefined) ??
      (payload.userId as string | undefined) ??
      (payload.ownerId as string | undefined);
    const eventType = raw.eventType as string;

    const event: DomainEvent = { eventType, userId: userId ?? '', payload, occurredAt: raw.occurredAt as string | undefined };

    if (!userId) {
      console.warn(`[PubSub][${subscriptionName}] evento sin userId, se descarta. id:`, message.id);
      message.ack();
      return;
    }

    const handler = eventRegistry[event.eventType];
    if (!handler) {
      // Sin handler registrado: no es un error, simplemente este
      // eventType todavía no le interesa al notification-service.
      console.warn(
        `[PubSub][${subscriptionName}] eventType sin handler registrado:`,
        event.eventType
      );
      message.ack();
      return;
    }

    const template = handler(event);
    if (!template) {
      // El handler decidió explícitamente que este evento no amerita notificación
      message.ack();
      return;
    }

    await sendUseCase.execute({
      userId,
      title: template.title,
      message: template.message,
      type: template.type,
      // margen de gracia: evita el falso "sendAt en el pasado" por el
      // desfase entre construir el DTO y validarlo en el use case
      sendAt: new Date(Date.now() + 2000),
    });

    console.log(
      `[PubSub][${subscriptionName}] ✔ notificación creada — eventType=${event.eventType} userId=${userId}`
    );

    message.ack();
  } catch (error) {
    console.error(`[PubSub][${subscriptionName}] Falló el procesamiento de`, message.id, error);
    // Sin ack: Pub/Sub reintentará según la política de la suscripción
    // (configura una dead-letter topic si quieres dejar de reintentar
    // después de N intentos)
    message.nack();
  }
}
