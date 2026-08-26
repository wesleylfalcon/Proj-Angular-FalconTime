import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA); // Recebe título e mensagem do dialog.
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>); // Controla o dialog aberto.

  /**
   * Confirma a ação e devolve true para quem abriu o dialog.
   */
  confirm(): void {
    this.dialogRef.close(true);
  }
}
