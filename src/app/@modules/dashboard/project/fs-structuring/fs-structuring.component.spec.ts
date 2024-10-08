import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FsStructuringComponent } from './fs-structuring.component';

describe('FsStructuringComponent', () => {
  let component: FsStructuringComponent;
  let fixture: ComponentFixture<FsStructuringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FsStructuringComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FsStructuringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
