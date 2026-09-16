import { NotificationType } from '../NotificationType';

describe('NotificationType Enum', () => {
  describe('Values', () => {
    it('should have all expected notification types', () => {
      expect(NotificationType.PET_INVITATION).toBe('PET_INVITATION');
      expect(NotificationType.VACCINE_DUE).toBe('VACCINE_DUE');
      expect(NotificationType.APPOINTMENT).toBe('APPOINTMENT');
      expect(NotificationType.MEDICATION).toBe('MEDICATION');
      expect(NotificationType.SHARED_ACCESS).toBe('SHARED_ACCESS');
      expect(NotificationType.GENERAL).toBe('GENERAL');
      expect(NotificationType.REMINDER).toBe('REMINDER');
    });

    it('should have exactly 7 notification types', () => {
      const values = Object.values(NotificationType);
      expect(values).toHaveLength(7);
    });

    it('should have correct keys', () => {
      const keys = Object.keys(NotificationType);
      expect(keys).toEqual([
        'PET_INVITATION',
        'VACCINE_DUE',
        'APPOINTMENT',
        'MEDICATION',
        'SHARED_ACCESS',
        'GENERAL',
        'REMINDER'
      ]);
    });
  });

  describe('Validation', () => {
    it('should validate correct notification types', () => {
      const validTypes = [
        NotificationType.PET_INVITATION,
        NotificationType.VACCINE_DUE,
        NotificationType.APPOINTMENT,
        NotificationType.MEDICATION,
        NotificationType.SHARED_ACCESS,
        NotificationType.GENERAL,
        NotificationType.REMINDER
      ];

      validTypes.forEach(type => {
        expect(Object.values(NotificationType)).toContain(type);
      });
    });

    it('should reject invalid notification types', () => {
      const invalidTypes = ['INVALID', 'NOTIFICATION', 'TEST', '', 'VACCINE', 'APPOINT'];

      invalidTypes.forEach(type => {
        expect(Object.values(NotificationType)).not.toContain(type);
      });
    });

    it('should check if a string is a valid NotificationType', () => {
      const isValid = (value: string): value is NotificationType => {
        return Object.values(NotificationType).includes(value as NotificationType);
      };

      expect(isValid('PET_INVITATION')).toBe(true);
      expect(isValid('VACCINE_DUE')).toBe(true);
      expect(isValid('APPOINTMENT')).toBe(true);
      expect(isValid('MEDICATION')).toBe(true);
      expect(isValid('SHARED_ACCESS')).toBe(true);
      expect(isValid('GENERAL')).toBe(true);
      expect(isValid('REMINDER')).toBe(true);
      expect(isValid('INVALID')).toBe(false);
      expect(isValid('')).toBe(false);
    });
  });
});