import { TestBed } from '@angular/core/testing';

import { SyncService } from './sync.service';
import { take } from 'rxjs';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection(), SyncService],
    });
    service = TestBed.inject(SyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit a refresh event when triggerRefresh is called', (done) => {
    // Only take the first emission to finish the test
    service
      .getRefreshStream()
      .pipe(take(1))
      .subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
    service.triggerRefresh();
  });

  it('should have initial in-flight requests value of 0', (done) => {
    service.inFlightRequests$.pipe(take(1)).subscribe((count) => {
      expect(count).toEqual(0);
      done();
    });
  });

  it('should map in-flight requests correctly through hasInFlightRequest$', () => {
    const emittedValues: boolean[] = [];
    const subscription = service.hasInFlightRequest$.subscribe((value) => {
      emittedValues.push(value);
    });

    // Since in-flight requests start at 0, the first emission should be false.
    expect(emittedValues[0]).toBeFalse();

    // Simulate an in-flight request by manually updating the BehaviorSubject.
    // (Accessing private property for test purposes.)
    (service as any)._inFlightRequests.next(1);
    expect(emittedValues[emittedValues.length - 1]).toBeTrue();

    // Simulate completion of all in-flight requests.
    (service as any)._inFlightRequests.next(0);
    expect(emittedValues[emittedValues.length - 1]).toBeFalse();

    subscription.unsubscribe();
  });
});
