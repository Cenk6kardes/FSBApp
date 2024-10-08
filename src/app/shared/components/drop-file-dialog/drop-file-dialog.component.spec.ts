import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropFileDialogComponent } from './drop-file-dialog.component';

describe('DropFileDialogComponent', () => {
  let component: DropFileDialogComponent;
  let fixture: ComponentFixture<DropFileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DropFileDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
