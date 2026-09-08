// Common
import { AsyncPipe, CurrencyPipe } from '@angular/common';

// Core
import { Component, inject } from '@angular/core';

// Forms
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// RxJS
import { combineLatest, map } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { ProjectService } from '../../projects/project.service';
import { TimeEntry, TimeEntryStatus } from '../time-entry.model';
import { TimeEntryService } from '../time-entry.service';

@Component({
  selector: 'app-time-entry-form',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './time-entry-form.html',
  styleUrl: './time-entry-form.scss',
})
export class TimeEntryForm {
  // Obtém as dependências utilizadas pelo formulário.
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);

  // Serviços utilizados no cadastro do apontamento.
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly dialogRef = inject(MatDialogRef<TimeEntryForm>);

  // Recebe o apontamento quando o dialog é aberto para edição.
  readonly data = inject<TimeEntry | null>(MAT_DIALOG_DATA);

  // Define os status disponíveis para o apontamento.
  readonly statuses: {
    value: TimeEntryStatus;
    label: string;
  }[] = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'BILLED', label: 'Faturado' },
    { value: 'PAID', label: 'Pago' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  /**
   * Combina projetos e parceiros para facilitar o preenchimento
   * automático dos dados relacionados ao projeto selecionado.
   */
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

  // Estrutura do formulário de apontamento.
  readonly form = this.formBuilder.nonNullable.group({
    projectId: ['', Validators.required],
    partnerId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [''],
    hours: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
    hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
    totalValue: [0],
    status: ['PENDING' as TimeEntryStatus, Validators.required],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        projectId: this.data.projectId,
        partnerId: this.data.partnerId,
        startDate: this.data.startDate,
        endDate: this.data.endDate ?? '',
        hours: this.data.hours,
        description: this.data.description,
        hourlyRate: this.data.hourlyRate,
        totalValue: this.data.totalValue,
        status: this.data.status,
      });
    }
  }

  /**
   * Preenche parceiro e valor/hora com base
   * no projeto selecionado.
   */
  fillProjectData(projectId: string): void {
    this.projects$.subscribe({
      next: (projects) => {
        const project = projects.find((item) => item.id === projectId);

        if (!project) {
          return;
        }

        this.form.patchValue({
          partnerId: project.partnerId,
          hourlyRate: project.hourlyRate,
        });

        this.calculateTotalValue();
      },
    });
  }

  /**
   * Calcula o valor total do apontamento
   * com base nas horas e no valor/hora.
   */
  calculateTotalValue(): void {
    const hours = this.form.controls.hours.value;
    const hourlyRate = this.form.controls.hourlyRate.value;

    this.form.controls.totalValue.setValue(hours * hourlyRate);
  }

  /**
   * Valida o formulário e cria ou atualiza o apontamento.
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    // Impede que a data final seja anterior à data inicial.
    if (formValue.endDate && formValue.endDate < formValue.startDate) {
      return;
    }

    if (this.data) {
      const updatedTimeEntry: TimeEntry = {
        ...this.data,
        ...formValue,
        endDate: formValue.endDate || null,
      };

      this.timeEntryService.updateTimeEntry(updatedTimeEntry).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
      });

      return;
    }

    const newTimeEntry = {
      ...formValue,
      endDate: formValue.endDate || null,
      createdAt: new Date().toISOString(),
    };

    this.timeEntryService.createTimeEntry(newTimeEntry).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
    });
  }
}
