import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerList } from './partner-list';

describe('PartnerList', () => {
  let component: PartnerList;
  let fixture: ComponentFixture<PartnerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
