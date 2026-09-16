import { PubSub } from '@google-cloud/pubsub';

let pubSubClient: PubSub | null = null;

/**
 * Devuelve una instancia única de PubSub para todo el proceso.
 *
 * Autenticación: en local usa GOOGLE_APPLICATION_CREDENTIALS apuntando
 * al JSON de la service account. En Cloud Run / GKE no hace falta nada
 * más: usa las credenciales por defecto del entorno (ADC).
 */
export function getPubSubClient(): PubSub {
  if (!pubSubClient) {
    pubSubClient = new PubSub({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
  }
  return pubSubClient;
}
