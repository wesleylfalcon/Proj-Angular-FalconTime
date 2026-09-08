// Common
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

// Core
import { Component, inject } from '@angular/core';

// Forms
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

// RxJS
import { BehaviorSubject, combineLatest, map, shareReplay, startWith, switchMap } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { ProjectService } from '../../projects/project.service';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { TimeEntryForm } from '../time-entry-form/time-entry-form';
import { TimeEntry } from '../time-entry.model';
import { TimeEntryService } from '../time-entry.service';

@Component({
  selector: 'app-time-entry-list',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './time-entry-list.html',
  styleUrl: './time-entry-list.scss',
})
export class TimeEntryList {
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);
  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);

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

  readonly filterForm = this.formBuilder.nonNullable.group({
    partnerId: [''],
    projectId: [''],
    startDate: [''],
    endDate: [''],
    status: [''],
  });

  private readonly refreshTimeEntries$ = new BehaviorSubject<void>(undefined);

  private readonly sourceTimeEntries$ = this.refreshTimeEntries$.pipe(
    switchMap(() => this.timeEntryService.getTimeEntries()),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  private readonly projects$ = this.projectService.getProjects().pipe(
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  readonly partners$ = this.partnerService.getPartners().pipe(
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  readonly filteredProjects$ = combineLatest([
    this.projects$,
    this.filterForm.controls.partnerId.valueChanges.pipe(
      startWith(this.filterForm.controls.partnerId.value),
    ),
  ]).pipe(
    map(([projects, partnerId]) =>
      partnerId ? projects.filter((project) => project.partnerId === partnerId) : projects,
    ),
  );

  /** Aplica os filtros e associa os nomes de projeto e parceiro aos apontamentos. */
  readonly timeEntries$ = combineLatest([
    this.sourceTimeEntries$,
    this.projects$,
    this.partners$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([timeEntries, projects, partners, filters]) =>
      timeEntries
        .filter((timeEntry) => {
          if (filters.partnerId && timeEntry.partnerId !== filters.partnerId) {
            return false;
          }

          if (filters.projectId && timeEntry.projectId !== filters.projectId) {
            return false;
          }

          if (filters.status && timeEntry.status !== filters.status) {
            return false;
          }

          // Considera interseção entre o período do apontamento e o período filtrado.
          const entryEnd = timeEntry.endDate ?? '9999-12-31';

          if (filters.startDate && entryEnd < filters.startDate) {
            return false;
          }

          if (filters.endDate && timeEntry.startDate > filters.endDate) {
            return false;
          }

          return true;
        })
        .map((timeEntry) => ({
          ...timeEntry,
          projectName:
            projects.find((project) => project.id === timeEntry.projectId)?.name ??
            'Projeto não encontrado',
          partnerName:
            partners.find((partner) => partner.id === timeEntry.partnerId)?.name ??
            'Parceiro não encontrado',
        })),
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  /** Calcula os indicadores dos apontamentos atualmente filtrados. */
  readonly summary$ = this.timeEntries$.pipe(
    map((timeEntries) => ({
      entries: timeEntries.length,
      hours: timeEntries.reduce((total, timeEntry) => total + timeEntry.hours, 0),
      totalValue: timeEntries.reduce((total, timeEntry) => total + timeEntry.totalValue, 0),
    })),
  );

  constructor() {
    this.filterForm.controls.partnerId.valueChanges.subscribe(() => {
      this.filterForm.controls.projectId.setValue('');
    });
  }

  /** Solicita uma nova consulta dos apontamentos. */
  loadTimeEntries(): void {
    this.refreshTimeEntries$.next();
  }

  /** Limpa todos os filtros da tela. */
  clearFilters(): void {
    this.filterForm.reset({
      partnerId: '',
      projectId: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  }

  /** Abre o formulário para cadastro de apontamento. */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TimeEntryForm, {
      width: '760px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.loadTimeEntries();
      }
    });
  }

  /** Abre o formulário preenchido com o apontamento selecionado. */
  openEditDialog(timeEntry: TimeEntry): void {
    const dialogRef = this.dialog.open(TimeEntryForm, {
      width: '760px',
      maxWidth: '95vw',
      data: timeEntry,
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadTimeEntries();
      }
    });
  }

  /** Confirma e exclui o apontamento selecionado. */
  deleteTimeEntry(timeEntry: TimeEntry): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir apontamento',
        message: 'Deseja realmente excluir este apontamento?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.timeEntryService.deleteTimeEntry(timeEntry.id).subscribe(() => {
        this.loadTimeEntries();
      });
    });
  }
}
