// Core
import { Pipe, PipeTransform } from '@angular/core';

// Interno
import { decimalHoursToTime } from '../utils/time.utils';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  /**
   * Exibe horas decimais no formato HH:mm.
   */
  transform(value: number): string {
    return decimalHoursToTime(value);
  }
}
