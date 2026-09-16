import { NotificationType } from '@/domain/enums/NotificationType';
import { EventRegistry } from '../types';

/**
 * Eventos que publica el microservicio de USUARIO.
 * Agrega aquí un nuevo eventType cada vez que ese equipo publique algo
 * nuevo — no hay que tocar el subscriber para nada de esto.
 */
export const userEventHandlers: EventRegistry = {
  USER_REGISTERED: () => ({
    title: '¡Bienvenido a la app!',
    message: 'Tu cuenta fue creada exitosamente.',
    type: NotificationType.GENERAL,
  }),

  USER_LOGIN: () => ({
    title: 'Nuevo inicio de sesión',
    message: 'Has iniciado sesión en tu cuenta.',
    type: NotificationType.GENERAL,
  }),

  USER_LOGOUT: () => ({
    title: 'Cierre de sesión',
    message: 'Tu sesión se cerró correctamente.',
    type: NotificationType.GENERAL,
  }),
};
