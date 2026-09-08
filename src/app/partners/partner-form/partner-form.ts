// Core
import { Component, inject } from '@angular/core';

// Forms
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Interno
import { Partner } from '../partner.model';
import { PartnerService } from '../partner.service';

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
  private readonly formBuilder = inject(FormBuilder);
  private readonly partnerService = inject(PartnerService);
  private readonly dialogRef = inject(MatDialogRef<PartnerForm>);

  readonly data = inject<Partner | null>(MAT_DIALOG_DATA);

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
      this.form.patchValue(this.data);
    }
  }

  /** Valida o formulário e cria ou atualiza o parceiro. */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.data) {
      this.partnerService
        .updatePartner({
          ...this.data,
          ...formValue,
        })
        .subscribe(() => this.dialogRef.close(true));

      return;
    }

    this.partnerService
      .createPartner({
        ...formValue,
        createdAt: new Date().toISOString(),
      })
      .subscribe(() => this.dialogRef.close(true));
  }
}
