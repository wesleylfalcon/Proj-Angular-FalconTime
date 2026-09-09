// Core
import { Injectable } from '@angular/core';

// RxJS
import { BehaviorSubject, Observable, from, map, switchMap } from 'rxjs';

// Interno
import { supabase } from '../core/supabase/supabase.client';
import { Partner } from './partner.model';

interface PartnerRow {
  id: string;
  user_id: string;
  name: string;
  document: string;
  contact_name: string;
  contact_email: string;
  hourly_rate: number;
  active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  /**
   * Lista os parceiros do usuário autenticado.
   */
  getPartners(): Observable<Partner[]> {
    return this.refreshSubject.pipe(
      switchMap(() => from(supabase.from('partners').select('*').order('name'))),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data ?? []).map((row) => this.mapRowToPartner(row as PartnerRow));
      }),
    );
  }

  /**
   * Cria um novo parceiro.
   */
  createPartner(partner: Omit<Partner, 'id' | 'createdAt'>): Observable<Partner> {
    return from(this.createPartnerRequest(partner));
  }

  /**
   * Atualiza um parceiro existente.
   */
  updatePartner(partner: Partner): Observable<Partner> {
    return from(this.updatePartnerRequest(partner));
  }

  /**
   * Exclui um parceiro.
   */
  deletePartner(id: string): Observable<void> {
    return from(this.deletePartnerRequest(id));
  }

  /**
   * Cria o parceiro no Supabase.
   */
  private async createPartnerRequest(partner: Omit<Partner, 'id' | 'createdAt'>): Promise<Partner> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw userError ?? new Error('Usuário não autenticado.');
    }

    const { data, error } = await supabase
      .from('partners')
      .insert({
        user_id: userData.user.id,
        name: partner.name,
        document: partner.document,
        contact_name: partner.contactName,
        contact_email: partner.contactEmail,
        hourly_rate: partner.hourlyRate,
        active: partner.active,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    this.refreshSubject.next();

    return this.mapRowToPartner(data as PartnerRow);
  }

  /**
   * Atualiza o parceiro no Supabase.
   */
  private async updatePartnerRequest(partner: Partner): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .update({
        name: partner.name,
        document: partner.document,
        contact_name: partner.contactName,
        contact_email: partner.contactEmail,
        hourly_rate: partner.hourlyRate,
        active: partner.active,
      })
      .eq('id', partner.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    this.refreshSubject.next();

    return this.mapRowToPartner(data as PartnerRow);
  }

  /**
   * Exclui o parceiro no Supabase.
   */
  private async deletePartnerRequest(id: string): Promise<void> {
    const { error } = await supabase.from('partners').delete().eq('id', id);

    if (error) {
      throw error;
    }

    this.refreshSubject.next();
  }

  /**
   * Converte o formato do banco
   * para o model utilizado pela aplicação.
   */
  private mapRowToPartner(row: PartnerRow): Partner {
    return {
      id: row.id,
      name: row.name,
      document: row.document,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      hourlyRate: Number(row.hourly_rate),
      active: row.active,
      createdAt: row.created_at,
    };
  }
}
