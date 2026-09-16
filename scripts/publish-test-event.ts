/**
 * Publica un evento de prueba en un topic de Pub/Sub.
 *
 * Uso:
 *   npx tsx scripts/publish-test-event.ts <topic> <eventType> <userId> [payloadJson]
 *
 * Ejemplos:
 *   npx tsx scripts/publish-test-event.ts user-events USER_LOGIN 3f2a...
 *   npx tsx scripts/publish-test-event.ts calendar-events VACCINE_DUE 3f2a... '{"petName":"Firulais","vaccineName":"Rabia"}'
 *
 * Contra el EMULADOR local: exporta PUBSUB_EMULATOR_HOST=localhost:8085
 * antes de correr el script (ver instrucciones en el chat).
 * Contra GCP real: necesitas GOOGLE_APPLICATION_CREDENTIALS apuntando
 * a una service account con permiso pubsub.publisher.
 */
import { PubSub } from '@google-cloud/pubsub';

async function main() {
  const [topicName, eventType, userId, payloadJson] = process.argv.slice(2);

  if (!topicName || !eventType || !userId) {
    console.error(
      'Uso: npx tsx scripts/publish-test-event.ts <topic> <eventType> <userId> [payloadJson]'
    );
    process.exit(1);
  }

  const pubsub = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });

  const event = {
    eventType,
    userId,
    payload: payloadJson ? JSON.parse(payloadJson) : undefined,
    occurredAt: new Date().toISOString(),
  };

  const messageId = await pubsub.topic(topicName).publishMessage({
    json: event,
    attributes: { eventType }, // útil si luego usas filtros de suscripción
  });

  console.log(`Publicado en "${topicName}" (messageId: ${messageId})`);
  console.log(event);
}

main().catch((error) => {
  console.error('Error publicando el evento de prueba', error);
  process.exit(1);
});
