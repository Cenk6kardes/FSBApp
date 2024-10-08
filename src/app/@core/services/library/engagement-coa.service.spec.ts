import { TestBed } from '@angular/core/testing';

import { EngagementCoaService } from './engagement-coa.service';

describe('EngagementCoaService', () => {
  let service: EngagementCoaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngagementCoaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
