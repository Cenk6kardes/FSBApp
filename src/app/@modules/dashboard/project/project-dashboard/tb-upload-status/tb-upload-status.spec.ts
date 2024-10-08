import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TBUploadStatusComponent } from './tb-upload-status.component';

describe('ProjectSettingsComponent', () => {
  let component: TBUploadStatusComponent;
  let fixture: ComponentFixture<TBUploadStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TBUploadStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TBUploadStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
