import { TestBed } from '@angular/core/testing';

import { GlobalCoaService } from './global-coa.service';

describe('GlobalCoaService', () => {
  let service: GlobalCoaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalCoaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
