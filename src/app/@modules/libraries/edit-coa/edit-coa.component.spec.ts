import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoaComponent } from './edit-coa.component';

describe('EditCoaComponent', () => {
  let component: EditCoaComponent;
  let fixture: ComponentFixture<EditCoaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCoaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCoaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
