import { NotificationType } from '@/domain/enums/NotificationType';
import { EventRegistry } from '../types';

/**
 * Eventos que publica el microservicio de MEDICAL PET.
 * 
 * Cada evento tiene su propio handler que genera la notificación
 * correspondiente con título, mensaje y tipo.
 * 
 * Los mensajes incluyen información específica como:
 * - petId: ID de la mascota
 * - visitId: ID de la visita
 * - labTestId: ID de la prueba
 * - etc.
 */
export const medicalPetEventHandlers: EventRegistry = {
  // ============================================
  // 📊 LAB TEST EVENTS
  // ============================================
  
  LAB_TEST_CREATED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const testName = event.payload?.testType as string ?? 'prueba de laboratorio';
    
    return {
      title: '📊 Nueva prueba de laboratorio',
      message: `Se ha creado una nueva prueba de laboratorio (${testName}) para ${petId}.`,
      type: NotificationType.GENERAL,
    };
  },

  LAB_TEST_RESULT_UPDATED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const testName = event.payload?.name as string ?? 'prueba';
    const isNormal = event.payload?.isNormal as boolean;
    const result = event.payload?.result as string ?? '';

    return {
      title: '📊 Resultado de laboratorio actualizado',
      message: `El resultado de la prueba ${testName} para ${petId} está disponible: ${result}${isNormal ? ' ✅ (Normal)' : ' ⚠️ (Requiere atención)'}`,
      type: isNormal ? NotificationType.GENERAL : NotificationType.VETERINARY_ALERT,
    };
  },

  LAB_TEST_IS_NORMAL_CHECKED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const testName = event.payload?.name as string ?? 'prueba';
    const isNormal = event.payload?.isNormal as boolean;

    return {
      title: '📊 Verificación de laboratorio',
      message: `La prueba ${testName} para ${petId} ${isNormal ? 'está dentro de los parámetros normales ✅' : 'está fuera de rango ⚠️'}`,
      type: isNormal ? NotificationType.GENERAL : NotificationType.VETERINARY_ALERT,
    };
  },

  // ============================================
  // 💊 MEDICATIONS EVENTS
  // ============================================

  MEDICATION_ADDED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const medicationName = event.payload?.name as string ?? 'medicamento';
    const dosage = event.payload?.dosage as string ?? '';
    const frequency = event.payload?.frequency as string ?? '';

    return {
      title: '💊 Nuevo medicamento agregado',
      message: `Se ha agregado ${medicationName} (${dosage}) para ${petId}. Frecuencia: ${frequency}.`,
      type: NotificationType.MEDICAL,
    };
  },
  
  MEDICATION_PRESCRIBED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const medicationName = event.payload?.name as string ?? 'medicamento';
    const dosage = event.payload?.dosage as string ?? '';

    return {
      title: '💊 Nueva medicación recetada',
      message: `Se ha recetado ${medicationName} (${dosage}) para ${petId}.`,
      type: NotificationType.MEDICAL,
    };
  },

  MEDICATION_ADMINISTERED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const medicationName = event.payload?.name as string ?? 'medicamento';
    const administeredBy = event.payload?.administeredBy as string ?? 'el veterinario';

    return {
      title: '💊 Medicación administrada',
      message: `${administeredBy} administró ${medicationName} a ${petId}.`,
      type: NotificationType.MEDICAL,
    };
  },

  MEDICATION_UPDATED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const medicationName = event.payload?.name as string ?? 'medicamento';
    const treatmentName = event.payload?.treatmentName as string ?? 'tratamiento';
    const changeMessage = event.payload?.changeMessage as string ?? '';

    return {
      title: '💊 Medicamento actualizado',
      message: `Se ha actualizado ${medicationName} en el tratamiento "${treatmentName}" para ${petId}: ${changeMessage}.`,
      type: NotificationType.MEDICAL,
    };
  },

  // ============================================
  // 🔪 SURGERY EVENTS
  // ============================================
  
  SURGERY_SCHEDULED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const surgeryType = event.payload?.type as string ?? 'cirugía';
    const scheduledDate = event.payload?.scheduledDate as string ?? 'fecha pendiente';
    const veterinarian = event.payload?.veterinarian as string ?? 'veterinario';

    return {
      title: '🔪 Cirugía programada',
      message: `Se ha programado una cirugía de ${surgeryType} para ${petId} el ${scheduledDate}. Veterinario: ${veterinarian}`,
      type: NotificationType.VETERINARY_ALERT,
    };
  },

  SURGERY_COMPLETED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const outcome = event.payload?.outcome as string ?? 'sin complicaciones';

    return {
      title: '🔪 Cirugía completada',
      message: `La cirugía de ${petId} ha finalizado con resultado: ${outcome}.`,
      type: NotificationType.GENERAL,
    };
  },

  // ============================================
  // 🩺 TREATMENTS EVENTS
  // ============================================
  
  TREATMENT_STARTED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const treatmentType = event.payload?.type as string ?? 'tratamiento';
    const protocol = event.payload?.protocol as string ?? '';

    return {
      title: '🩺 Nuevo tratamiento iniciado',
      message: `Se ha iniciado un tratamiento de ${treatmentType} para ${petId}.${protocol ? ` Protocolo: ${protocol}` : ''}`,
      type: NotificationType.MEDICAL,
    };
  },

  TREATMENT_UPDATED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const progress = event.payload?.progress as number ?? 0;
    const status = event.payload?.status as string ?? 'en progreso';

    return {
      title: '🩺 Progreso de tratamiento',
      message: `El tratamiento de ${petId} ha avanzado al ${progress}% (${status}).`,
      type: NotificationType.GENERAL,
    };
  },

  TREATMENT_COMPLETED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const outcome = event.payload?.outcome as string ?? 'completado';

    return {
      title: '🩺 Tratamiento completado',
      message: `El tratamiento de ${petId} ha finalizado con resultado: ${outcome}.`,
      type: NotificationType.GENERAL,
    };
  },

  // ============================================
  // 💉 VACCINE EVENTS
  // ============================================
  
  VACCINE_APPLIED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const vaccineName = event.payload?.name as string ?? 'vacuna';
    const nextDoseDate = event.payload?.nextDoseDate as string ?? 'pendiente';
    const veterinarian = event.payload?.veterinarian as string ?? 'veterinario';

    return {
      title: '💉 Vacuna aplicada',
      message: `${veterinarian} aplicó la vacuna ${vaccineName} a ${petId}. Próxima dosis: ${nextDoseDate}`,
      type: NotificationType.MEDICAL,
    };
  },

  VACCINE_DUE_REMINDER: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const vaccineName = event.payload?.vaccineName as string ?? 'vacuna';
    const dueDate = event.payload?.dueDate as string ?? 'fecha pendiente';

    return {
      title: '⏰ Recordatorio de vacuna',
      message: `Recordatorio: La vacuna ${vaccineName} para ${petId} vence el ${dueDate}. Tienes 24 horas para confirmar su aplicación.`,
      type: NotificationType.VACCINE_DUE,
    };
  },

  // ✅ NUEVO: Evento para vacuna retrasada
  VACCINE_OVERDUE_REMINDER: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const vaccineName = event.payload?.vaccineName as string ?? 'vacuna';
    const dueDate = event.payload?.dueDate as string ?? 'fecha pendiente';

    return {
      title: '⚠️ Vacuna retrasada',
      message: `La vacuna ${vaccineName} para ${petId} está retrasada (debía aplicarse el ${dueDate}). Por favor, agenda una cita lo antes posible.`,
      type: NotificationType.VETERINARY_ALERT,
    };
  },

  VACCINE_UPDATED: (event) => {
  const petId = event.payload?.petId as string ?? 'tu mascota';
  const vaccineName = event.payload?.name as string ?? 'vacuna';
  const changes = event.payload?.changes as Record<string, { old: unknown; new: unknown }> ?? {};
  
  let changeMessage = '';
  const changeDescriptions: string[] = [];
  
  // ✅ Type-safe con unknown
  if (changes.name) {
    const { old, new: newVal } = changes.name;
    changeDescriptions.push(`nombre: "${String(old)}" → "${String(newVal)}"`);
  }
  if (changes.nextDoseDate) {
    const { old, new: newVal } = changes.nextDoseDate;
    changeDescriptions.push(`próxima dosis: "${String(old)}" → "${String(newVal)}"`);
  }
  if (changes.status) {
    const { old, new: newVal } = changes.status;
    changeDescriptions.push(`estado: "${String(old)}" → "${String(newVal)}"`);
  }
  
  changeMessage = changeDescriptions.join(', ');

  return {
    title: '📝 Vacuna actualizada',
    message: `Se actualizó la vacuna ${vaccineName} para ${petId}: ${changeMessage}`,
    type: NotificationType.GENERAL,
  };
},

  // ============================================
  // 📅 VISITS EVENTS
  // ============================================
  
  VISIT_SCHEDULED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const reason = event.payload?.reason as string ?? 'consulta general';
    const scheduledDate = event.payload?.scheduledDate as string ?? 'fecha pendiente';
    const veterinarian = event.payload?.veterinarian as string ?? 'veterinario';

    return {
      title: '📅 Visita veterinaria programada',
      message: `Visita programada para ${petId} el ${scheduledDate} (${reason}). Veterinario: ${veterinarian}`,
      type: NotificationType.GENERAL,
    };
  },

  VISIT_COMPLETED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const diagnosis = event.payload?.diagnosis as string ?? 'revisión completada';
    const prescriptions = event.payload?.prescriptions as string[] ?? [];

    return {
      title: '📅 Visita veterinaria completada',
      message: `La visita de ${petId} ha finalizado. Diagnóstico: ${diagnosis}${prescriptions.length > 0 ? ` (${prescriptions.length} medicamentos recetados)` : ''}`,
      type: NotificationType.GENERAL,
    };
  },

 // ✅ NUEVO: Recordatorio DUE
VISIT_DUE_REMINDER: (event) => {
  const petId = event.payload?.petId as string ?? 'tu mascota';
  const reason = event.payload?.reason as string ?? 'consulta general';
  const scheduledDate = event.payload?.scheduledDate as string ?? 'fecha pendiente';
  const veterinarian = event.payload?.veterinarian as string ?? 'veterinario';

  return {
    title: '⏰ ¡Recordatorio de visita!',
    message: `Hoy tienes una visita programada para ${petId} (${reason}). Veterinario: ${veterinarian}. ¡No faltes!`,
    type: NotificationType.GENERAL,
  };
},

// ✅ NUEVO: Recordatorio OVERDUE
VISIT_OVERDUE_REMINDER: (event) => {
  const petId = event.payload?.petId as string ?? 'tu mascota';
  const reason = event.payload?.reason as string ?? 'consulta general';
  const scheduledDate = event.payload?.scheduledDate as string ?? 'fecha pendiente';
  const veterinarian = event.payload?.veterinarian as string ?? 'veterinario';

  return {
    title: '⚠️ Visita retrasada',
    message: `La visita de ${petId} (${reason}) estaba programada para el ${new Date(scheduledDate).toLocaleDateString('es-ES')} y aún no se ha realizado. Por favor, agenda una nueva cita.`,
    type: NotificationType.VETERINARY_ALERT,
  };
},

  // ============================================
  // ⚖️ WEIGHT RECORD EVENTS
  // ============================================

  WEIGHT_RECORDED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const weight = event.payload?.weight as number ?? 0;
    const unit = event.payload?.unit as string ?? 'kg';
    const notes = event.payload?.notes as string ?? '';

    return {
      title: '⚖️ Registro de peso',
      message: `${petId} pesa ${weight} ${unit}.${notes ? ` Notas: ${notes}` : ''}`,
      type: NotificationType.GENERAL,
    };
  },

  WEIGHT_UPDATED: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const oldWeight = event.payload?.oldWeight as number ?? 0;
    const newWeight = event.payload?.newWeight as number ?? 0;
    const unit = event.payload?.unit as string ?? 'kg';
    const notes = event.payload?.notes as string ?? '';
    const change = newWeight - oldWeight;
    const changeText = change > 0 ? `aumentó (+${change.toFixed(1)})` : `disminuyó (${change.toFixed(1)})`;

    return {
      title: '⚖️ Actualización de peso',
      message: `${petId} ${changeText} de ${oldWeight} a ${newWeight} ${unit}.${notes ? ` Notas: ${notes}` : ''}`,
      type: NotificationType.GENERAL,
    };
  },

  WEIGHT_ALERT: (event) => {
    const petId = event.payload?.petId as string ?? 'tu mascota';
    const currentWeight = event.payload?.currentWeight as number ?? 0;
    const previousWeight = event.payload?.previousWeight as number ?? 0;
    const percentageChange = event.payload?.percentageChange as number ?? 0;
    const alertType = event.payload?.alertType as string ?? 'cambio';

    return {
      title: '⚖️ Alerta de peso',
      message: `⚠️ ${petId}: ${alertType.toLowerCase()} de peso del ${percentageChange.toFixed(1)}% (${previousWeight} → ${currentWeight} kg). Requiere atención veterinaria.`,
      type: NotificationType.VETERINARY_ALERT,
    };
  },
};