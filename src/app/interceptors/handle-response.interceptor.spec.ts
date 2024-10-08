import { TestBed } from '@angular/core/testing';

import { HandleResponseInterceptor } from './handle-response.interceptor';

describe('HandleResponseInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HandleResponseInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HandleResponseInterceptor = TestBed.inject(HandleResponseInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
