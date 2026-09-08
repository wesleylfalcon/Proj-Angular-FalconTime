//Common
import { HttpClient } from '@angular/common/http';

//Core
import { inject, Injectable } from '@angular/core';

//RXJS
import { Observable } from 'rxjs';

//Interno
import { TimeEntry } from './time-entry.model';

@Injectable({
  providedIn: 'root',
})
export class TimeEntryService {
  private readonly http = inject(HttpClient); // Obtém a instância do HttpClient.
  private readonly apiUrl = 'http://localhost:3000/timeEntries';

  /**
   * Busca todos os apontamentos cadastrados.
   */
  getTimeEntries(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(this.apiUrl);
  }

  /**
   * Cadastra um novo apontamento na API.
   */
  createTimeEntry(timeEntry: Omit<TimeEntry, 'id'>): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(this.apiUrl, timeEntry);
  }

  /**
   * Atualiza os dados de um apontamento existente.
   */
  updateTimeEntry(timeEntry: TimeEntry): Observable<TimeEntry> {
    return this.http.put<TimeEntry>(`${this.apiUrl}/${timeEntry.id}`, timeEntry);
  }

  /**
   * Exclui um apontamento pelo identificador.
   */
  deleteTimeEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
