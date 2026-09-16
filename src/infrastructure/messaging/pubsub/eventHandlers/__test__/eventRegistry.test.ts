import { eventRegistry } from '../index';
import { NotificationType } from '@/domain/enums/NotificationType';
import { DomainEvent } from '../../types';

describe('eventRegistry', () => {
  it('should map USER_REGISTERED to a GENERAL notification', () => {
    const event: DomainEvent = { eventType: 'USER_REGISTERED', userId: 'user-1' };

    const template = eventRegistry[event.eventType](event);

    expect(template).not.toBeNull();
    expect(template?.type).toBe(NotificationType.GENERAL);
    expect(template?.title).toBeTruthy();
    expect(template?.message).toBeTruthy();
  });

  it('should map USER_LOGIN to a GENERAL notification', () => {
    const event: DomainEvent = { eventType: 'USER_LOGIN', userId: 'user-1' };

    const template = eventRegistry[event.eventType](event);

    expect(template?.type).toBe(NotificationType.GENERAL);
  });

  it('should build a notification from title/description on CALENDAR_PET_CREATED', () => {
    const event: DomainEvent = {
      eventType: 'CALENDAR_PET_CREATED',
      userId: 'user-1',
      payload: {
        petId: 'pet-1',
        title: 'Cita control Paco',
        description: 'Cita control Paco - Veterinario Dr. Pet',
        eventType: 'VET_APPOINTMENT',
        startDate: '2026-07-15T10:00:00.000Z',
        endDate: '2026-07-15T11:00:00.000Z',
      },
    };

    const template = eventRegistry[event.eventType](event);

    expect(template).not.toBeNull();
    expect(template?.title).toBe('📅 Evento agregado al calendario de mascota (pet-1)');
    expect(template?.message).toBe('Cita control de pet-1: Cita control Paco');
    expect(template?.type).toBe(NotificationType.GENERAL);
  });

  it('should append the location to the message when present', () => {
    const event: DomainEvent = {
      eventType: 'CALENDAR_PET_CREATED',
      userId: 'user-1',
      payload: {
        petId: 'pet-1',
        title: 'Cita control Paco',
        eventType: 'VET_APPOINTMENT',
        startDate: '2026-07-15T10:00:00.000Z',
        endDate: '2026-07-15T11:00:00.000Z',
        location: 'Clínica Veterinaria Central',
      },
    };

    const template = eventRegistry[event.eventType](event);

    expect(template?.message).toBe('Cita control de pet-1: Cita control Paco — 📍 Clínica Veterinaria Central');
  });

  it('should build a notification on CALENDAR_USER_CREATED using userId', () => {
    const event: DomainEvent = {
      eventType: 'CALENDAR_USER_CREATED',
      userId: 'user-1',
      payload: {
        userId: 'user-1',
        title: 'Recordatorio personal',
        eventType: 'PERSONAL',
        startDate: '2026-07-15T10:00:00.000Z',
        endDate: '2026-07-15T11:00:00.000Z',
      },
    };

    const template = eventRegistry[event.eventType](event);

    expect(template?.title).toBe('📅 Evento agregado al calendario de usuario (user-1)');
    expect(template?.message).toBe('Cita control de user-1: Recordatorio personal');
    expect(template?.type).toBe(NotificationType.GENERAL);
  });

  it('should build an update notification on CALENDAR_EVENT_UPDATED', () => {
    const event: DomainEvent = {
      eventType: 'CALENDAR_EVENT_UPDATED',
      userId: 'user-1',
      payload: {
        petId: 'pet-1',
        title: 'Cita control Paco',
        eventType: 'VET_APPOINTMENT',
        startDate: '2026-07-15T10:00:00.000Z',
        endDate: '2026-07-15T11:00:00.000Z',
      },
    };

    const template = eventRegistry[event.eventType](event);

    expect(template?.title).toBe('📅 Evento del calendario actualizado');
    expect(template?.message).toBe('Cita control de pet-1: Cita control Paco');
    expect(template?.type).toBe(NotificationType.GENERAL);
  });

  it('should build a reminder notification on CALENDAR_EVENT_REMINDER', () => {
    const event: DomainEvent = {
      eventType: 'CALENDAR_EVENT_REMINDER',
      userId: 'user-1',
      payload: {
        petId: 'pet-1',
        title: 'Cita control Paco',
        eventType: 'VET_APPOINTMENT',
        startDate: '2026-07-15T10:00:00.000Z',
        endDate: '2026-07-15T11:00:00.000Z',
      },
    };

    const template = eventRegistry[event.eventType](event);

    expect(template?.title).toBe('⏰ Recordatorio de tu calendario');
    expect(template?.message).toBe('Cita control de pet-1: Cita control Paco');
    expect(template?.type).toBe(NotificationType.GENERAL);
  });

  it('should discard a calendar event without a title', () => {
    const event: DomainEvent = { eventType: 'CALENDAR_PET_CREATED', userId: 'user-1', payload: {} };

    expect(eventRegistry[event.eventType](event)).toBeNull();
  });

  it('should not have a handler for an unregistered eventType', () => {
    expect(eventRegistry['SOME_UNKNOWN_EVENT']).toBeUndefined();
  });

  it('every registered handler should return title, message and a valid NotificationType', () => {
    const sampleEvent: DomainEvent = {
      eventType: 'placeholder',
      userId: 'user-1',
      payload: { petName: 'Firulais', vaccineName: 'Rabia', date: '2026-09-01' },
    };

    for (const [eventType, handler] of Object.entries(eventRegistry)) {
      const template = handler({ ...sampleEvent, eventType });
      if (template === null) continue; // handlers pueden decidir no notificar

      expect(template.title).toBeTruthy();
      expect(template.message).toBeTruthy();
      expect(Object.values(NotificationType)).toContain(template.type);
    }
  });
});
