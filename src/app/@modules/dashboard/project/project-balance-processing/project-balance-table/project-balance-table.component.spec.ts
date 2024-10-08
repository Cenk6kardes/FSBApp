import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBalanceTableComponent } from './project-balance-table.component';

describe('ProjectBalanceTableComponent', () => {
  let component: ProjectBalanceTableComponent;
  let fixture: ComponentFixture<ProjectBalanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBalanceTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectBalanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
