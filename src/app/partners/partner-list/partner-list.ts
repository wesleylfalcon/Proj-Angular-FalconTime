//Core
import { Component, inject } from '@angular/core';

//Common
import { AsyncPipe } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

//RXJS
import { BehaviorSubject, switchMap } from 'rxjs';

//Interno
import { PartnerForm } from '../partner-form/partner-form';
import { PartnerService } from '../partner.service';
import { Partner } from '../partner.model';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';

/**
 * Tela responsável pela listagem dos parceiros cadastrados.
 */
@Component({
  selector: 'app-partner-list',
  imports: [AsyncPipe, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './partner-list.html',
  styleUrl: './partner-list.scss',
})
export class PartnerList {
  private readonly partnerService = inject(PartnerService); // Obtém a instância do PartnerService.
  private readonly dialog = inject(MatDialog); // Obtém o serviço responsável pelos dialogs.

  /**
   * BehaviorSubject é um tipo de Observable do RxJS que também permite
   * emitir novos valores manualmente através do método next().
   *
   * Aqui ele funciona como um gatilho: sempre que emitirmos um valor,
   * solicitamos uma nova busca dos parceiros na API.
   */
  private readonly refreshPartners$ = new BehaviorSubject<void>(undefined);

  /**
   * switchMap é um operador do RxJS que troca o fluxo atual por outro Observable.
   *
   * Sempre que refreshPartners$ emitir, switchMap executará getPartners()
   * novamente e disponibilizará a nova lista retornada pela API.
   */
  readonly partners$ = this.refreshPartners$.pipe(
    switchMap(() => this.partnerService.getPartners()),
  );

  readonly displayedColumns = [
    'name',
    'document',
    'contactName',
    'hourlyRate',
    'active',
    'actions',
  ];

  /**
   * Solicita uma nova consulta dos parceiros cadastrados.
   */
  loadPartners(): void {
    this.refreshPartners$.next();
  }

  /**
   * Abre o formulário de cadastro e atualiza a listagem após salvar.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PartnerForm, {
      width: '720px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe({
      next: (created) => {
        if (created) {
          this.loadPartners();
        }
      },
    });
  }

  /**
   * Abre o formulário preenchido com os dados do parceiro selecionado.
   */
  openEditDialog(partner: Partner): void {
    const dialogRef = this.dialog.open(PartnerForm, {
      width: '720px',
      maxWidth: '95vw',
      data: partner,
    });

    dialogRef.afterClosed().subscribe({
      next: (updated) => {
        if (updated) {
          this.loadPartners();
        }
      },
    });
  }

  /**
   * Solicita confirmação antes de excluir o parceiro selecionado.
   */
  deletePartner(partner: Partner): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir parceiro',
        message: `Deseja realmente excluir ${partner.name}?`,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (confirmed) => {
        if (!confirmed) {
          return;
        }

        this.partnerService.deletePartner(partner.id).subscribe({
          next: () => {
            this.loadPartners();
          },
        });
      },
    });
  }
}
