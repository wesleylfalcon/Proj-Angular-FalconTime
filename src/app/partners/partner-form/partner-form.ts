//Core
import { Component, inject } from '@angular/core';

//Forms
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

//Interno
import { PartnerService } from '../partner.service';
import { Partner } from '../partner.model';

@Component({
  selector: 'app-partner-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './partner-form.html',
  styleUrl: './partner-form.scss',
})
export class PartnerForm {
  /**
   * FormBuilder é um serviço do Angular Reactive Forms que facilita
   * a criação e organização de FormGroups e seus controles.
   */
  private readonly formBuilder = inject(FormBuilder);
  private readonly partnerService = inject(PartnerService); // Serviço responsável pelos dados de parceiros.
  private readonly dialogRef = inject(MatDialogRef<PartnerForm>); // Controla o dialog atualmente aberto.
  readonly data = inject<Partner | null>(MAT_DIALOG_DATA); // Recebe o parceiro quando o dialog é aberto para edição.

  /**
   * FormGroup representa o formulário como um conjunto de controles.
   * Cada propriedade abaixo corresponde a um campo e pode possuir
   * valor inicial e regras de validação.
   */
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    document: ['', Validators.required],
    contactName: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
    hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
    active: [true],
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        //patchValue preenche valores de um FormGroup sem exigir que você informe todos os controles existentes.
        name: this.data.name,
        document: this.data.document,
        contactName: this.data.contactName,
        contactEmail: this.data.contactEmail,
        hourlyRate: this.data.hourlyRate,
        active: this.data.active,
      });
    }
  }

  /**
   * Processa o formulário somente quando todos os campos forem válidos
   * e envia o novo parceiro para a API.
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.data) {
      const updatedPartner: Partner = {
        ...this.data,
        ...formValue,
      };

      this.partnerService.updatePartner(updatedPartner).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
      });

      return;
    }

    const newPartner = {
      ...formValue,
      createdAt: new Date().toISOString(),
    };

    this.partnerService.createPartner(newPartner).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
    });
  }
}
