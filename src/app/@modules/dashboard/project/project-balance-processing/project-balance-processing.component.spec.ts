import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBalanceProcessingComponent } from './project-balance-processing.component';

describe('ProjectBalanceProcessingComponent', () => {
  let component: ProjectBalanceProcessingComponent;
  let fixture: ComponentFixture<ProjectBalanceProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBalanceProcessingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectBalanceProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
