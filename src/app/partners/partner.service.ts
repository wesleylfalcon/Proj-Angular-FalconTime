//Core
import { inject, Injectable } from '@angular/core';

//Common
import { HttpClient } from '@angular/common/http';

//RXJS
import { Observable } from 'rxjs';

//Interno
import { Partner } from './partner.model';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  /**
   * inject() utiliza o sistema de Dependency Injection do Angular para obter
   * uma instância de uma dependência sem precisar recebê-la pelo constructor.
   *
   * Aqui obtemos o HttpClient, serviço utilizado para realizar requisições HTTP.
   */
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/partners'; // Endpoint da API responsável pelos parceiros.

  /**
   * Busca todos os parceiros cadastrados.
   *
   * Observable é um tipo do RxJS que representa um fluxo de dados assíncrono.
   * Ele pode emitir valores ao longo do tempo e permite que quem o consome
   * reaja aos dados, erros e à conclusão desse fluxo.
   *
   * Neste caso, o Observable emitirá um Partner[] quando a API responder
   * à requisição HTTP.
   */
  getPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(this.apiUrl);
  }

  /**
   * Cadastra um novo parceiro na API.
   *
   * Omit é um utility type do TypeScript que cria um novo tipo a partir de outro, removendo uma ou mais propriedades
   */
  createPartner(partner: Omit<Partner, 'id'>): Observable<Partner> {
    return this.http.post<Partner>(this.apiUrl, partner);
  }

  /**
   * Atualiza os dados de um parceiro existente.
   */
  updatePartner(partner: Partner): Observable<Partner> {
    return this.http.put<Partner>(`${this.apiUrl}/${partner.id}`, partner);
  }

  /**
   * Exclui um parceiro pelo identificador.
   */
  deletePartner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
