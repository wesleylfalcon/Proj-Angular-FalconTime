import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectList } from './project-list';

describe('ProjectList', () => {
  let component: ProjectList;
  let fixture: ComponentFixture<ProjectList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
