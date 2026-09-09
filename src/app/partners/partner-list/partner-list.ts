// Common
import { AsyncPipe, CurrencyPipe } from '@angular/common';

// Core
import { Component, inject } from '@angular/core';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// Interno
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { PartnerForm } from '../partner-form/partner-form';
import { Partner } from '../partner.model';
import { PartnerService } from '../partner.service';

/** Tela responsável pela listagem dos parceiros cadastrados. */
@Component({
  selector: 'app-partner-list',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './partner-list.html',
  styleUrl: './partner-list.scss',
})
export class PartnerList {
  private readonly partnerService = inject(PartnerService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['name', 'contactName', 'hourlyRate', 'active', 'actions'];

  readonly partners$ = this.partnerService.getPartners();

  /** Abre o formulário para cadastro de parceiro. */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PartnerForm, {
      width: '720px',
      maxWidth: '95vw',
    });
  }

  /** Abre o formulário preenchido com o parceiro selecionado. */
  openEditDialog(partner: Partner): void {
    const dialogRef = this.dialog.open(PartnerForm, {
      width: '720px',
      maxWidth: '95vw',
      data: partner,
    });
  }

  /** Confirma e exclui o parceiro selecionado. */
  deletePartner(partner: Partner): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir parceiro',
        message: `Deseja realmente excluir ${partner.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.partnerService.deletePartner(partner.id).subscribe();
    });
  }
}
