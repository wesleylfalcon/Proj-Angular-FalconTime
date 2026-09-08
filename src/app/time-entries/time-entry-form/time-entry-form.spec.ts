// Testing
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

// Material
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

// RxJS
import { of } from 'rxjs';

// Interno
import { PartnerService } from '../../partners/partner.service';
import { ProjectService } from '../../projects/project.service';
import { TimeEntryService } from '../time-entry.service';
import { TimeEntryForm } from './time-entry-form';

describe('TimeEntryForm', () => {
  let component: TimeEntryForm;
  let fixture: ComponentFixture<TimeEntryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TimeEntryForm,
      ],
      providers: [
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

        // Evita chamadas HTTP reais durante o teste unitário.
        {
          provide: ProjectService,
          useValue: {
            getProjects: () => of([]),
          },
        },
        {
          provide: PartnerService,
          useValue: {
            getPartners: () => of([]),
          },
        },
        {
          provide: TimeEntryService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(TimeEntryForm);

    component = fixture.componentInstance;

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});