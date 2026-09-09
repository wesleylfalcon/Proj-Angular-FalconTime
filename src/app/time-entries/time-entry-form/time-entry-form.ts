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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

// RxJS
import { combineLatest, map, shareReplay, take } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { ProjectService } from '../../projects/project.service';
import { TimeEntry, TimeEntryStatus } from '../time-entry.model';
import { TimeEntryService } from '../time-entry.service';
import { dateToIsoDate, isoDateToDate } from '../../shared/utils/date.utils';
import { decimalHoursToTime, isValidTime, timeToDecimalHours } from '../../shared/utils/time.utils';

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
    MatDatepickerModule,
    MatIconModule,
  ],
  templateUrl: './time-entry-form.html',
  styleUrl: './time-entry-form.scss',
})
export class TimeEntryForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly partnerService = inject(PartnerService);
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly dialogRef = inject(MatDialogRef<TimeEntryForm>);

  readonly data = inject<TimeEntry | null>(MAT_DIALOG_DATA);

  readonly statuses: { value: TimeEntryStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'BILLED', label: 'Faturado' },
    { value: 'PAID', label: 'Pago' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  /** Combina projetos e parceiros para o preenchimento automático do formulário. */
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
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  readonly form = this.formBuilder.nonNullable.group({
    projectId: ['', Validators.required],
    partnerId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null],
    hours: ['00:00', Validators.required],
    description: ['', Validators.required],
    hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
    totalValue: [0],
    status: ['PENDING' as TimeEntryStatus, Validators.required],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        ...this.data,
        startDate: isoDateToDate(this.data.startDate),
        endDate: isoDateToDate(this.data.endDate),
        hours: decimalHoursToTime(this.data.hours),
      });
    }
  }

  /** Preenche parceiro e valor/hora com base no projeto selecionado. */
  fillProjectData(projectId: string): void {
    this.projects$.pipe(take(1)).subscribe((projects) => {
      const project = projects.find((item) => item.id === projectId);

      if (!project) {
        return;
      }

      this.form.patchValue({
        partnerId: project.partnerId,
        hourlyRate: project.hourlyRate,
      });

      this.calculateTotalValue();
    });
  }

  /** Recalcula o valor total com base em horas e valor/hora. */
  calculateTotalValue(): void {
    const hours = timeToDecimalHours(this.form.controls.hours.value);
    const hourlyRate = this.form.controls.hourlyRate.value;

    this.form.controls.totalValue.setValue(hours * hourlyRate);
  }

  /** Valida o formulário e cria ou atualiza o apontamento. */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (!isValidTime(formValue.hours)) {
      this.form.controls.hours.setErrors({
        invalidTime: true,
      });

      return;
    }

    const startDate = dateToIsoDate(formValue.startDate);
    const endDate = formValue.endDate ? dateToIsoDate(formValue.endDate) : null;

    if (endDate && endDate < startDate) {
      this.form.controls.endDate.setErrors({
        beforeStart: true,
      });

      this.form.controls.endDate.markAsTouched();

      return;
    }

    const normalizedValue = {
      ...formValue,
      startDate,
      endDate,
      hours: timeToDecimalHours(formValue.hours),
    };

    if (this.form.controls.endDate.hasError('beforeStart')) {
      this.form.controls.endDate.setErrors(null);
    }

    if (this.data) {
      this.timeEntryService
        .updateTimeEntry({
          ...this.data,
          ...normalizedValue,
        })
        .subscribe(() => this.dialogRef.close(true));

      return;
    }

    this.timeEntryService
      .createTimeEntry({
        ...normalizedValue,
      })
      .subscribe(() => this.dialogRef.close(true));
  }
}
