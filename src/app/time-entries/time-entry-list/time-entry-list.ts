// Common
import { AsyncPipe, CurrencyPipe } from '@angular/common';

// Core
import { Component, inject } from '@angular/core';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

// RxJS
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { ProjectService } from '../../projects/project.service';
import { TimeEntryService } from '../time-entry.service';
import { TimeEntryForm } from '../time-entry-form/time-entry-form';
import { TimeEntry } from '../time-entry.model';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-time-entry-list',
  imports: [AsyncPipe, CurrencyPipe, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './time-entry-list.html',
  styleUrl: './time-entry-list.scss',
})
export class TimeEntryList {
  // Obtém os serviços necessários para carregar apontamentos, projetos e parceiros.
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);
  private readonly dialog = inject(MatDialog); // Serviço responsável pela abertura dos dialogs.

  // Define as colunas exibidas na tabela de apontamentos.
  readonly displayedColumns = [
    'startDate',
    'endDate',
    'partner',
    'project',
    'hours',
    'totalValue',
    'status',
    'actions',
  ];

  // Gatilho utilizado para recarregar os apontamentos.
  private readonly refreshTimeEntries$ = new BehaviorSubject<void>(undefined);

  /**
   * Carrega os apontamentos e associa os nomes
   * dos respectivos projetos e parceiros.
   */
  readonly timeEntries$ = combineLatest([
    this.refreshTimeEntries$.pipe(switchMap(() => this.timeEntryService.getTimeEntries())),
    this.projectService.getProjects(),
    this.partnerService.getPartners(),
  ]).pipe(
    map(([timeEntries, projects, partners]) =>
      timeEntries.map((timeEntry) => ({
        ...timeEntry,

        projectName:
          projects.find((project) => project.id === timeEntry.projectId)?.name ??
          'Projeto não encontrado',

        partnerName:
          partners.find((partner) => partner.id === timeEntry.partnerId)?.name ??
          'Parceiro não encontrado',
      })),
    ),
  );

  /**
   * Abre o formulário de cadastro e atualiza
   * a listagem após salvar.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TimeEntryForm, {
      width: '760px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe({
      next: (created) => {
        if (created) {
          this.loadTimeEntries();
        }
      },
    });
  }

  /**
   * Solicita uma nova consulta dos apontamentos.
   */
  loadTimeEntries(): void {
    this.refreshTimeEntries$.next();
  }

  /**
   * Abre o formulário preenchido com os dados
   * do apontamento selecionado.
   */
  openEditDialog(timeEntry: TimeEntry): void {
    const dialogRef = this.dialog.open(TimeEntryForm, {
      width: '760px',
      maxWidth: '95vw',
      data: timeEntry,
    });

    dialogRef.afterClosed().subscribe({
      next: (updated) => {
        if (updated) {
          this.loadTimeEntries();
        }
      },
    });
  }

  /**
   * Solicita confirmação antes de excluir
   * o apontamento selecionado.
   */
  deleteTimeEntry(timeEntry: TimeEntry): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir apontamento',
        message: 'Deseja realmente excluir este apontamento?',
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (confirmed) => {
        if (!confirmed) {
          return;
        }

        this.timeEntryService.deleteTimeEntry(timeEntry.id).subscribe({
          next: () => {
            this.loadTimeEntries();
          },
        });
      },
    });
  }
}
