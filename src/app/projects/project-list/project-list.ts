//Common
import { AsyncPipe } from '@angular/common';

//Core
import { Component, inject } from '@angular/core';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

//RXJS
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';

//Interno
import { ProjectService } from '../project.service';
import { PartnerService } from '../../partners/partner.service';
import { ProjectForm } from '../project-form/project-form';
import { Project } from '../project.model';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-project-list',
  imports: [AsyncPipe, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList {
  private readonly projectService = inject(ProjectService); // Obtém a instância do ProjectService.
  private readonly partnerService = inject(PartnerService); // Obtém a instância do PartnerService.
  private readonly dialog = inject(MatDialog); // Obtém o serviço responsável por abrir dialogs.

  readonly displayedColumns = [
    'name',
    'partner',
    'billingType',
    'estimatedHours',
    'hourlyRate',
    'status',
    'actions',
  ];

  /**
   * BehaviorSubject usado como gatilho para recarregar a lista de projetos.
   */
  private readonly refreshProjects$ = new BehaviorSubject<void>(undefined);

  /**
   * Sempre que refreshProjects$ emitir, busca novamente os projetos.
   * Depois combina projetos e parceiros para exibir o nome do parceiro na tabela.
   */
  readonly projects$ = combineLatest([
    this.refreshProjects$.pipe(switchMap(() => this.projectService.getProjects())),
    this.partnerService.getPartners(),
  ]).pipe(
    map(([projects, partners]) =>
      projects.map((project) => ({
        ...project,
        partnerName:
          partners.find((partner) => partner.id === project.partnerId)?.name ??
          'Parceiro não encontrado',
      })),
    ),
  );

  /**
   * Abre o formulário de cadastro e atualiza a listagem após salvar.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectForm, {
      width: '760px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe({
      next: (created) => {
        if (created) {
          this.loadProjects();
        }
      },
    });
  }

  /**
   * Solicita uma nova consulta dos projetos cadastrados.
   */
  loadProjects(): void {
    this.refreshProjects$.next();
  }

  /**
   * Abre o formulário preenchido com os dados do projeto selecionado.
   */
  openEditDialog(project: Project): void {
    const dialogRef = this.dialog.open(ProjectForm, {
      width: '760px',
      maxWidth: '95vw',
      data: project,
    });

    dialogRef.afterClosed().subscribe({
      next: (updated) => {
        if (updated) {
          this.loadProjects();
        }
      },
    });
  }

  /**
   * Solicita confirmação antes de excluir o projeto selecionado.
   */
  deleteProject(project: Project): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir projeto',
        message: `Deseja realmente excluir ${project.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (confirmed) => {
        if (!confirmed) {
          return;
        }

        this.projectService.deleteProject(project.id).subscribe({
          next: () => {
            this.loadProjects();
          },
        });
      },
    });
  }
}
