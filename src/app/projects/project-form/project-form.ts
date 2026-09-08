//Core
import { Component, inject } from '@angular/core';

//Common
import { AsyncPipe } from '@angular/common';

//Forms
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

//RXJS
import { map } from 'rxjs';

//Interno
import { PartnerService } from '../../partners/partner.service';
import { ProjectBillingType, ProjectStatus } from '../project.model';
import { ProjectService } from '../project.service';
import { Project } from '../project.model';

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
  private readonly formBuilder = inject(FormBuilder); // Obtém o FormBuilder para montar o formulário.
  private readonly partnerService = inject(PartnerService); // Obtém o serviço responsável pelos parceiros.
  private readonly projectService = inject(ProjectService); // Serviço responsável pelos dados de projetos.
  private readonly dialogRef = inject(MatDialogRef<ProjectForm>); // Controla o dialog atualmente aberto.

  readonly data = inject<Project | null>(MAT_DIALOG_DATA); // Recebe o projeto quando o dialog é aberto para edição.

  /**
   * map é um operador do RxJS usado para transformar o valor emitido
   * por um Observable em outro valor.
   *
   * Aqui transformamos a lista completa de parceiros em uma lista
   * contendo somente parceiros ativos.
   */
  readonly activePartners$ = this.partnerService
    .getPartners()
    .pipe(map((partners) => partners.filter((partner) => partner.active)));

  readonly billingTypes: {
    value: ProjectBillingType;
    label: string;
  }[] = [
    {
      value: 'CLOSED_SCOPE',
      label: 'Escopo fechado',
    },
    {
      value: 'HOURLY',
      label: 'Por hora',
    },
  ];

  readonly statuses: {
    value: ProjectStatus;
    label: string;
  }[] = [
    {
      value: 'PLANNED',
      label: 'Planejado',
    },
    {
      value: 'IN_PROGRESS',
      label: 'Em andamento',
    },
    {
      value: 'COMPLETED',
      label: 'Concluído',
    },
    {
      value: 'CANCELLED',
      label: 'Cancelado',
    },
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
      this.form.patchValue({
        name: this.data.name,
        partnerId: this.data.partnerId,
        billingType: this.data.billingType,
        hourlyRate: this.data.hourlyRate,
        estimatedHours: this.data.estimatedHours,
        startDate: this.data.startDate,
        status: this.data.status,
        description: this.data.description,
      });
    }
  }

  /**
   * Atualiza o valor/hora do projeto com o valor padrão
   * definido no parceiro selecionado.
   */
  fillPartnerHourlyRate(partnerId: string): void {
    this.activePartners$.subscribe({
      next: (partners) => {
        const partner = partners.find((item) => item.id === partnerId);

        if (partner) {
          this.form.controls.hourlyRate.setValue(partner.hourlyRate);
        }
      },
    });
  }

  /**
   * Valida o formulário e cria ou atualiza o projeto.
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.data) {
      const updatedProject: Project = {
        ...this.data,
        ...formValue,
      };

      this.projectService.updateProject(updatedProject).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
      });

      return;
    }

    const newProject = {
      ...formValue,
      createdAt: new Date().toISOString(),
    };

    this.projectService.createProject(newProject).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
    });
  }
}
