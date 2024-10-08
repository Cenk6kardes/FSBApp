import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCoaBalanceSheetComponent } from './global-coa-balance-sheet.component';

describe('GlobalCoaBalanceSheetComponent', () => {
  let component: GlobalCoaBalanceSheetComponent;
  let fixture: ComponentFixture<GlobalCoaBalanceSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalCoaBalanceSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCoaBalanceSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
