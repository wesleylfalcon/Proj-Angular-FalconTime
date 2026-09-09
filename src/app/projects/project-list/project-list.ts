// Common
import { AsyncPipe, CurrencyPipe } from '@angular/common';

// Core
import { Component, inject } from '@angular/core';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// RxJS
import { combineLatest, map } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { ProjectForm } from '../project-form/project-form';
import { Project } from '../project.model';
import { ProjectService } from '../project.service';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-project-list',
  imports: [AsyncPipe, CurrencyPipe, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule, DurationPipe],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList {
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    'name',
    'partner',
    'billingType',
    'estimatedHours',
    'hourlyRate',
    'status',
    'actions',
  ];

  /** Combina projetos e parceiros para exibir o nome do parceiro na tabela. */
  readonly projects$ = combineLatest([
    this.projectService.getProjects(),
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

  /** Abre o formulário para cadastro de projeto. */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectForm, {
      width: '760px',
      maxWidth: '95vw',
    });
  }

  /** Abre o formulário preenchido com o projeto selecionado. */
  openEditDialog(project: Project): void {
    const dialogRef = this.dialog.open(ProjectForm, {
      width: '760px',
      maxWidth: '95vw',
      data: project,
    });
  }

  /** Confirma e exclui o projeto selecionado. */
  deleteProject(project: Project): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir projeto',
        message: `Deseja realmente excluir ${project.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.projectService.deleteProject(project.id).subscribe();
    });
  }
}
