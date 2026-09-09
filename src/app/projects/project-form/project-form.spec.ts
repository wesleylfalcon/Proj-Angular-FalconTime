import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Material
import { provideNativeDateAdapter } from '@angular/material/core';

import { ProjectForm } from './project-form';

describe('ProjectForm', () => {
  let component: ProjectForm;
  let fixture: ComponentFixture<ProjectForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectForm],
      providers: [
        provideNativeDateAdapter(),

        {
          provide: MAT_DIALOG_DATA,
          useValue: null,
        },

        {
          provide: MatDialogRef,
          useValue: {
            close: () => {},
          },
        },

        // ...demais mocks/providers que você já tem
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
