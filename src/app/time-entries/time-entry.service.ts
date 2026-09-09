// Core
import { Injectable } from '@angular/core';

// RxJS
import { BehaviorSubject, Observable, from, map, switchMap } from 'rxjs';

// Interno
import { supabase } from '../core/supabase/supabase.client';
import { TimeEntry } from './time-entry.model';

interface TimeEntryRow {
  id: string;
  user_id: string;
  partner_id: string;
  project_id: string;
  start_date: string;
  end_date: string | null;
  hours: number;
  description: string;
  hourly_rate: number;
  total_value: number;
  status: TimeEntry['status'];
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimeEntryService {
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  /**
   * Lista os apontamentos do usuário autenticado.
   */
  getTimeEntries(): Observable<TimeEntry[]> {
    return this.refreshSubject.pipe(
      switchMap(() =>
        from(
          supabase.from('time_entries').select('*').order('start_date', {
            ascending: false,
          }),
        ),
      ),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data ?? []).map((row) => this.mapRowToTimeEntry(row as TimeEntryRow));
      }),
    );
  }

  /**
   * Cria um novo apontamento.
   */
  createTimeEntry(timeEntry: Omit<TimeEntry, 'id' | 'createdAt'>): Observable<TimeEntry> {
    return from(this.createTimeEntryRequest(timeEntry));
  }

  /**
   * Atualiza um apontamento existente.
   */
  updateTimeEntry(timeEntry: TimeEntry): Observable<TimeEntry> {
    return from(this.updateTimeEntryRequest(timeEntry));
  }

  /**
   * Exclui um apontamento.
   */
  deleteTimeEntry(id: string): Observable<void> {
    return from(this.deleteTimeEntryRequest(id));
  }

  /**
   * Cria o apontamento no Supabase.
   */
  private async createTimeEntryRequest(
    timeEntry: Omit<TimeEntry, 'id' | 'createdAt'>,
  ): Promise<TimeEntry> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw userError ?? new Error('Usuário não autenticado.');
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: userData.user.id,
        partner_id: timeEntry.partnerId,
        project_id: timeEntry.projectId,
        start_date: timeEntry.startDate,
        end_date: timeEntry.endDate,
        hours: timeEntry.hours,
        description: timeEntry.description,
        hourly_rate: timeEntry.hourlyRate,
        total_value: timeEntry.totalValue,
        status: timeEntry.status,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    this.refreshSubject.next();

    return this.mapRowToTimeEntry(data as TimeEntryRow);
  }

  /**
   * Atualiza o apontamento no Supabase.
   */
  private async updateTimeEntryRequest(timeEntry: TimeEntry): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        partner_id: timeEntry.partnerId,
        project_id: timeEntry.projectId,
        start_date: timeEntry.startDate,
        end_date: timeEntry.endDate,
        hours: timeEntry.hours,
        description: timeEntry.description,
        hourly_rate: timeEntry.hourlyRate,
        total_value: timeEntry.totalValue,
        status: timeEntry.status,
      })
      .eq('id', timeEntry.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    this.refreshSubject.next();

    return this.mapRowToTimeEntry(data as TimeEntryRow);
  }

  /**
   * Exclui o apontamento no Supabase.
   */
  private async deleteTimeEntryRequest(id: string): Promise<void> {
    const { error } = await supabase.from('time_entries').delete().eq('id', id);

    if (error) {
      throw error;
    }

    this.refreshSubject.next();
  }

  /**
   * Converte o formato do banco
   * para o model utilizado pela aplicação.
   */
  private mapRowToTimeEntry(row: TimeEntryRow): TimeEntry {
    return {
      id: row.id,
      partnerId: row.partner_id,
      projectId: row.project_id,
      startDate: row.start_date,
      endDate: row.end_date,
      hours: Number(row.hours),
      description: row.description,
      hourlyRate: Number(row.hourly_rate),
      totalValue: Number(row.total_value),
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
