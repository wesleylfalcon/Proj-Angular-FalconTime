// Common
import { AsyncPipe } from '@angular/common';

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
import { map, shareReplay } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { Project, ProjectBillingType, ProjectStatus } from '../project.model';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-project-form',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly partnerService = inject(PartnerService);
  private readonly projectService = inject(ProjectService);
  private readonly dialogRef = inject(MatDialogRef<ProjectForm>);

  readonly data = inject<Project | null>(MAT_DIALOG_DATA);

  /**
   * Exibe parceiros ativos e mantém disponível o parceiro atual
   * quando um projeto antigo está vinculado a um parceiro inativo.
   */
  readonly availablePartners$ = this.partnerService.getPartners().pipe(
    map((partners) =>
      partners.filter((partner) => partner.active || partner.id === this.data?.partnerId),
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  readonly billingTypes: { value: ProjectBillingType; label: string }[] = [
    { value: 'CLOSED_SCOPE', label: 'Escopo fechado' },
    { value: 'HOURLY', label: 'Por hora' },
  ];

  readonly statuses: { value: ProjectStatus; label: string }[] = [
    { value: 'PLANNED', label: 'Planejado' },
    { value: 'IN_PROGRESS', label: 'Em andamento' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    partnerId: ['', Validators.required],
    billingType: ['CLOSED_SCOPE' as ProjectBillingType, Validators.required],
    hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
    estimatedHours: [0, [Validators.required, Validators.min(0.01)]],
    startDate: ['', Validators.required],
    status: ['PLANNED' as ProjectStatus, Validators.required],
    description: [''],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  /** Preenche o valor/hora padrão do parceiro selecionado. */
  fillPartnerHourlyRate(partnerId: string): void {
    this.availablePartners$.subscribe((partners) => {
      const partner = partners.find((item) => item.id === partnerId);

      if (partner) {
        this.form.controls.hourlyRate.setValue(partner.hourlyRate);
      }
    });
  }

  /** Valida o formulário e cria ou atualiza o projeto. */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.data) {
      this.projectService
        .updateProject({
          ...this.data,
          ...formValue,
        })
        .subscribe(() => this.dialogRef.close(true));

      return;
    }

    this.projectService
      .createProject({
        ...formValue,
        createdAt: new Date().toISOString(),
      })
      .subscribe(() => this.dialogRef.close(true));
  }
}
