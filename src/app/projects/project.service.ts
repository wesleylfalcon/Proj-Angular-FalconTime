//Core
import { inject, Injectable } from '@angular/core';

//Common
import { HttpClient } from '@angular/common/http';

//RXJS
import { Observable } from 'rxjs';

//Interno
import { Project } from './project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient); // Obtém o HttpClient para realizar requisições à API.

  private readonly apiUrl = 'http://localhost:3000/projects'; // Endpoint da API de projetos.

  /**
   * Busca todos os projetos cadastrados.
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  /**
   * Cadastra um novo projeto na API.
   */
  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  /**
   * Atualiza os dados de um projeto existente.
   */
  updateProject(project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${project.id}`, project);
  }

  /**
   * Exclui um projeto pelo identificador.
   */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
