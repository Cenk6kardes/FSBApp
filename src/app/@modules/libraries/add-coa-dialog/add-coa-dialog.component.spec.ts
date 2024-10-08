import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoaDialogComponent } from './add-coa-dialog.component';

describe('AddCoaDialogComponent', () => {
  let component: AddCoaDialogComponent;
  let fixture: ComponentFixture<AddCoaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCoaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCoaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
