import {TestBed} from '@angular/core/testing';
import {NorceAdapterService} from './norce-adapter.service';

describe('NorceService', () => {
  let service: NorceAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NorceAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
