// Core
import { Injectable } from '@angular/core';

// RxJS
import { BehaviorSubject, Observable, from, map, switchMap } from 'rxjs';

// Interno
import { supabase } from '../core/supabase/supabase.client';
import { Project } from './project.model';

interface ProjectRow {
  id: string;
  user_id: string;
  partner_id: string;
  name: string;
  billing_type: Project['billingType'];
  hourly_rate: number;
  estimated_hours: number;
  start_date: string;
  status: Project['status'];
  description: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  /**
   * Lista os projetos do usuário autenticado.
   */
  getProjects(): Observable<Project[]> {
    return this.refreshSubject.pipe(
      switchMap(() => from(supabase.from('projects').select('*').order('name'))),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data ?? []).map((row) => this.mapRowToProject(row as ProjectRow));
      }),
    );
  }

  /**
   * Cria um novo projeto.
   */
  createProject(project: Omit<Project, 'id' | 'createdAt'>): Observable<Project> {
    return from(this.createProjectRequest(project));
  }

  /**
   * Atualiza um projeto existente.
   */
  updateProject(project: Project): Observable<Project> {
    return from(this.updateProjectRequest(project));
  }

  /**
   * Exclui um projeto.
   */
  deleteProject(id: string): Observable<void> {
    return from(this.deleteProjectRequest(id));
  }

  /**
   * Cria o projeto no Supabase.
   */
  private async createProjectRequest(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw userError ?? new Error('Usuário não autenticado.');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userData.user.id,
        partner_id: project.partnerId,
        name: project.name,
        billing_type: project.billingType,
        hourly_rate: project.hourlyRate,
        estimated_hours: project.estimatedHours,
        start_date: project.startDate,
        status: project.status,
        description: project.description,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    this.refreshSubject.next();

    return this.mapRowToProject(data as ProjectRow);
  }

  /**
   * Atualiza o projeto no Supabase.
   */
  private async updateProjectRequest(project: Project): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        partner_id: project.partnerId,
        name: project.name,
        billing_type: project.billingType,
        hourly_rate: project.hourlyRate,
        estimated_hours: project.estimatedHours,
        start_date: project.startDate,
        status: project.status,
        description: project.description,
      })
      .eq('id', project.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    this.refreshSubject.next();

    return this.mapRowToProject(data as ProjectRow);
  }

  /**
   * Exclui o projeto no Supabase.
   */
  private async deleteProjectRequest(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      throw error;
    }

    this.refreshSubject.next();
  }

  /**
   * Converte o formato do banco
   * para o model utilizado pela aplicação.
   */
  private mapRowToProject(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      partnerId: row.partner_id,
      billingType: row.billing_type,
      hourlyRate: Number(row.hourly_rate),
      estimatedHours: Number(row.estimated_hours),
      startDate: row.start_date,
      status: row.status,
      description: row.description,
      createdAt: row.created_at,
    };
  }
}
