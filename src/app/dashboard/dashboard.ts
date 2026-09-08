// Common
import { AsyncPipe, CurrencyPipe } from '@angular/common';

// Core
import { Component, inject } from '@angular/core';

// Forms
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// RxJS
import { combineLatest, map, shareReplay, startWith } from 'rxjs';

// Charts
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// Interno
import { PartnerService } from '../partners/partner.service';
import { ProjectService } from '../projects/project.service';
import { TimeEntryService } from '../time-entries/time-entry.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    ReactiveFormsModule,
    BaseChartDirective,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);
  private readonly formBuilder = inject(FormBuilder);

  readonly filterForm = this.formBuilder.nonNullable.group({
    competence: [this.getCurrentCompetence()],
    partnerId: [''],
    projectId: [''],
    status: [''],
  });

  /**
   * Centraliza os dados do dashboard e evita consultas HTTP repetidas
   * entre filtros, indicadores e gráficos.
   */
  private readonly data$ = combineLatest([
    this.timeEntryService.getTimeEntries(),
    this.projectService.getProjects(),
    this.partnerService.getPartners(),
  ]).pipe(
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  /** Disponibiliza os parceiros para o filtro. */
  readonly partners$ = this.data$.pipe(map(([, , partners]) => partners));

  /** Filtra os projetos conforme o parceiro selecionado. */
  readonly filteredProjects$ = combineLatest([
    this.data$.pipe(map(([, projects]) => projects)),
    this.filterForm.controls.partnerId.valueChanges.pipe(
      startWith(this.filterForm.controls.partnerId.value),
    ),
  ]).pipe(
    map(([projects, partnerId]) =>
      partnerId ? projects.filter((project) => project.partnerId === partnerId) : projects,
    ),
  );

  /** Aplica os filtros sobre os apontamentos exibidos no dashboard. */
  private readonly filteredData$ = combineLatest([
    this.data$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([[timeEntries, projects, partners], filters]) => {
      const competenceStart = filters.competence ? `${filters.competence}-01` : '';
      const competenceEnd = filters.competence ? this.getMonthEndDate(filters.competence) : '';

      const filteredTimeEntries = timeEntries.filter((timeEntry) => {
        if (filters.partnerId && timeEntry.partnerId !== filters.partnerId) {
          return false;
        }

        if (filters.projectId && timeEntry.projectId !== filters.projectId) {
          return false;
        }

        if (filters.status && timeEntry.status !== filters.status) {
          return false;
        }

        // Sem data fim, o apontamento é considerado em andamento.
        const entryEnd = timeEntry.endDate ?? '9999-12-31';

        if (competenceStart && entryEnd < competenceStart) {
          return false;
        }

        if (competenceEnd && timeEntry.startDate > competenceEnd) {
          return false;
        }

        return true;
      });

      return {
        timeEntries: filteredTimeEntries,
        projects,
        partners,
      };
    }),
  );

  /** Calcula os principais indicadores financeiros e de horas. */
  readonly summary$ = this.filteredData$.pipe(
    map(({ timeEntries }) => {
      const validEntries = timeEntries.filter((timeEntry) => timeEntry.status !== 'CANCELLED');

      return {
        totalHours: validEntries.reduce((total, timeEntry) => total + timeEntry.hours, 0),
        totalValue: validEntries.reduce((total, timeEntry) => total + timeEntry.totalValue, 0),
        billedValue: validEntries
          .filter((timeEntry) => timeEntry.status === 'BILLED' || timeEntry.status === 'PAID')
          .reduce((total, timeEntry) => total + timeEntry.totalValue, 0),
        paidValue: validEntries
          .filter((timeEntry) => timeEntry.status === 'PAID')
          .reduce((total, timeEntry) => total + timeEntry.totalValue, 0),
      };
    }),
  );

  /** Monta os dados dos gráficos a partir dos apontamentos filtrados. */
  readonly charts$ = this.filteredData$.pipe(
    map(({ timeEntries, projects, partners }) => {
      const hoursByProject = new Map<string, number>();
      const valueByPartner = new Map<string, number>();

      timeEntries
        .filter((timeEntry) => timeEntry.status !== 'CANCELLED')
        .forEach((timeEntry) => {
          hoursByProject.set(
            timeEntry.projectId,
            (hoursByProject.get(timeEntry.projectId) ?? 0) + timeEntry.hours,
          );

          valueByPartner.set(
            timeEntry.partnerId,
            (valueByPartner.get(timeEntry.partnerId) ?? 0) + timeEntry.totalValue,
          );
        });

      return {
        hoursByProject: {
          labels: Array.from(hoursByProject.keys()).map(
            (projectId) =>
              projects.find((project) => project.id === projectId)?.name ?? 'Projeto não encontrado',
          ),
          datasets: [
            {
              label: 'Horas',
              data: Array.from(hoursByProject.values()),
            },
          ],
        } as ChartData<'bar'>,

        valueByPartner: {
          labels: Array.from(valueByPartner.keys()).map(
            (partnerId) =>
              partners.find((partner) => partner.id === partnerId)?.name ?? 'Parceiro não encontrado',
          ),
          datasets: [
            {
              label: 'Valor',
              data: Array.from(valueByPartner.values()),
            },
          ],
        } as ChartData<'bar'>,
      };
    }),
  );

  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  constructor() {
    this.filterForm.controls.partnerId.valueChanges.subscribe(() => {
      this.filterForm.controls.projectId.setValue('');
    });
  }

  /** Limpa os filtros e retorna para a competência atual. */
  clearFilters(): void {
    this.filterForm.reset({
      competence: this.getCurrentCompetence(),
      partnerId: '',
      projectId: '',
      status: '',
    });
  }

  /** Retorna o último dia da competência no formato YYYY-MM-DD. */
  private getMonthEndDate(competence: string): string {
    const [year, month] = competence.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();

    return `${competence}-${String(lastDay).padStart(2, '0')}`;
  }

  /** Retorna a competência atual no formato YYYY-MM. */
  private getCurrentCompetence(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
  }
}
