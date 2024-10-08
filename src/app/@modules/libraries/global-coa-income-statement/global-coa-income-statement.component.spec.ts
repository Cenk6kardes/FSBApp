import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCoaIncomeStatementComponent } from './global-coa-income-statement.component';

describe('GlobalCoaIncomeStatementComponent', () => {
  let component: GlobalCoaIncomeStatementComponent;
  let fixture: ComponentFixture<GlobalCoaIncomeStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalCoaIncomeStatementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCoaIncomeStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
