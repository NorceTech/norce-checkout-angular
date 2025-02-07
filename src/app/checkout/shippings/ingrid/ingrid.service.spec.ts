import { TestBed } from '@angular/core/testing';

import { IngridService } from './ingrid.service';

describe('IngridService', () => {
  let service: IngridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
