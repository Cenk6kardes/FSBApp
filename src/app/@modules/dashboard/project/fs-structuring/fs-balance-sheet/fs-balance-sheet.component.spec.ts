import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FsBalanceSheetComponent } from './fs-balance-sheet.component';

describe('FsBalanceSheetComponent', () => {
  let component: FsBalanceSheetComponent;
  let fixture: ComponentFixture<FsBalanceSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FsBalanceSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FsBalanceSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
