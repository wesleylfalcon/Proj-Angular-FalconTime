// HTTP
import { HttpClient } from '@angular/common/http';

// Core
import { inject, Injectable } from '@angular/core';

// RxJS
import { Observable } from 'rxjs';

// Interno
import { Partner } from './partner.model';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/partners';

  /** Busca todos os parceiros cadastrados. */
  getPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(this.apiUrl);
  }

  /** Cadastra um novo parceiro. */
  createPartner(partner: Omit<Partner, 'id'>): Observable<Partner> {
    return this.http.post<Partner>(this.apiUrl, partner);
  }

  /** Atualiza um parceiro existente. */
  updatePartner(partner: Partner): Observable<Partner> {
    return this.http.put<Partner>(`${this.apiUrl}/${partner.id}`, partner);
  }

  /** Exclui um parceiro pelo identificador. */
  deletePartner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
