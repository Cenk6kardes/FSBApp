import { TestBed } from '@angular/core/testing';

import { RoleManagerService } from './role-manager.service';

describe('RoleManagerService', () => {
  let service: RoleManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
