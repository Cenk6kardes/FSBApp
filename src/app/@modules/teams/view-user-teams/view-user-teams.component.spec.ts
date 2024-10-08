import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserTeamsComponent } from './view-user-teams.component';

describe('ViewUserTeamsComponent', () => {
  let component: ViewUserTeamsComponent;
  let fixture: ComponentFixture<ViewUserTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewUserTeamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewUserTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
