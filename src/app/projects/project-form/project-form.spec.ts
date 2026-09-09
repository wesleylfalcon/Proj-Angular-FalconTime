import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ProjectForm } from './project-form';

describe('ProjectForm', () => {
  let component: ProjectForm;
  let fixture: ComponentFixture<ProjectForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectForm],
      providers: [        
        {
          provide: MAT_DIALOG_DATA,
          useValue: null,
        },
        {
          provide: MatDialogRef,// Simula o controle do dialog fornecido pelo Angular Material.
          useValue: {
            close: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
