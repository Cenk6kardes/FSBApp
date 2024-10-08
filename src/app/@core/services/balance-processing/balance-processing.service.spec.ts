import { TestBed } from '@angular/core/testing';

import { BalanceProcessingService } from './balance-processing.service';

describe('BalanceProcessingService', () => {
  let service: BalanceProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalanceProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
