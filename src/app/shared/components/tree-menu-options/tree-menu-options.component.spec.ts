import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeMenuOptionsComponent } from './tree-menu-options.component';

describe('TreeMenuOptionsComponent', () => {
  let component: TreeMenuOptionsComponent;
  let fixture: ComponentFixture<TreeMenuOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeMenuOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeMenuOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
