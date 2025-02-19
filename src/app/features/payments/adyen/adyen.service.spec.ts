import { TestBed } from '@angular/core/testing';

import { AdyenService } from './adyen.service';

describe('AdyenService', () => {
  let service: AdyenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdyenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
