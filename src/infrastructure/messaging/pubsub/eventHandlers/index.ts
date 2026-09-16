import { EventRegistry } from '../types';
import { userEventHandlers } from './userEvents.handlers';
import { petEventHandlers } from './petEvents.handlers';
import { calendarEventHandlers } from './calendarEvents.handlers';
import { medicalPetEventHandlers } from './medicalPetEvents.handlers';

/**
 * Punto único donde se combinan los handlers de cada microservicio
 * emisor. Para sumar un nuevo dominio (ej. médico, pagos):
 *   1. crea `medicalEvents.handlers.ts` con su propio EventRegistry
 *   2. impórtalo y agrégalo al spread de abajo
 * El subscriber no necesita saber nada de esto.
 */
export const eventRegistry: EventRegistry = {
  ...userEventHandlers,
  ...petEventHandlers,
  ...calendarEventHandlers,
  ...medicalPetEventHandlers,
};
