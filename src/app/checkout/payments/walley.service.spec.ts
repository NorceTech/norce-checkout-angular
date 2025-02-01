import { TestBed } from '@angular/core/testing';

import { WalleyService } from './walley.service';

describe('WalleyService', () => {
  let service: WalleyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalleyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
