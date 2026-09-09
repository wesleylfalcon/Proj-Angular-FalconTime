import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeEntryList } from './time-entry-list';

import { provideNativeDateAdapter } from '@angular/material/core';

describe('TimeEntryList', () => {
  let component: TimeEntryList;
  let fixture: ComponentFixture<TimeEntryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeEntryList],
      providers: [provideNativeDateAdapter()],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeEntryList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
