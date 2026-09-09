/**
 * Converte YYYY-MM-DD para Date sem alteração de fuso horário.
 */
export function isoDateToDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

/**
 * Converte Date para YYYY-MM-DD.
 */
export function dateToIsoDate(value: Date | null): string {
  if (!value) {
    return '';
  }

  const year = value.getFullYear();

  const month = String(value.getMonth() + 1).padStart(2, '0');

  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
