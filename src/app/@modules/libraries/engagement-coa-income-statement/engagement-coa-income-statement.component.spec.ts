import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagementCoaIncomeStatementComponent } from './engagement-coa-income-statement.component';

describe('EngagementCoaIncomeStatementComponent', () => {
  let component: EngagementCoaIncomeStatementComponent;
  let fixture: ComponentFixture<EngagementCoaIncomeStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngagementCoaIncomeStatementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngagementCoaIncomeStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
