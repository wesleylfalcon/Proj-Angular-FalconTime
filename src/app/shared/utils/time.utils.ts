/**
 * Converte horas decimais para HH:mm.
 *
 * Exemplo:
 * 8.5 -> 08:30
 */
export function decimalHoursToTime(decimalHours: number): string {
  if (decimalHours === null || decimalHours === undefined || Number.isNaN(decimalHours)) {
    return '00:00';
  }

  const totalMinutes = Math.round(decimalHours * 60);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Converte HH:mm para horas decimais.
 *
 * Exemplo:
 * 08:30 -> 8.5
 */
export function timeToDecimalHours(value: string): number {
  if (!value) {
    return 0;
  }

  const [hours, minutes] = value.split(':').map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours + minutes / 60;
}

/**
 * Valida um valor no formato HH:mm.
 */
export function isValidTime(value: string): boolean {
  return /^\d{1,3}:[0-5]\d$/.test(value);
}
