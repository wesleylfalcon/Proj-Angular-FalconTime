import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { TimeEntryService } from './time-entry.service';

describe('TimeEntryService', () => {
  let service: TimeEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    service = TestBed.inject(TimeEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
