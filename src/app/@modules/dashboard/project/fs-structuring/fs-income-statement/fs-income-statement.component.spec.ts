import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FsIncomeStatementComponent } from './fs-income-statement.component';

describe('FsIncomeStatementComponent', () => {
  let component: FsIncomeStatementComponent;
  let fixture: ComponentFixture<FsIncomeStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FsIncomeStatementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FsIncomeStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
