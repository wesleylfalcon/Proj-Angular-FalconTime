import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import { PartnerForm } from './partner-form';

describe('PartnerForm', () => {
  let component: PartnerForm;
  let fixture: ComponentFixture<PartnerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerForm],
      providers: [
        // Simula o MatDialogRef fornecido pelo Angular Material ao abrir o dialog.
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        },

        // Simula um cadastro novo, sem dados de parceiro para edição.
        {
          provide: MAT_DIALOG_DATA,
          useValue: null
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});