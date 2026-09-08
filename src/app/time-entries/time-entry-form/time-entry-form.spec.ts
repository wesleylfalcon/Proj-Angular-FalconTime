import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimeEntryForm } from './time-entry-form';

describe('TimeEntryForm', () => {
  let component: TimeEntryForm;
  let fixture: ComponentFixture<TimeEntryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeEntryForm],
      providers: [
        provideHttpClient(),
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeEntryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
