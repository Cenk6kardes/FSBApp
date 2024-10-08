import { TestBed } from '@angular/core/testing';

import { LoggerPublishersService } from './logger-publishers.service';

describe('LoggerPublishersService', () => {
  let service: LoggerPublishersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerPublishersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
