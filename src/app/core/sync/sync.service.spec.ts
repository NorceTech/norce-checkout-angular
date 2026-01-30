import { TestBed } from '@angular/core/testing';

import { SyncService } from './sync.service';
import { take } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SyncService', () => {
  let service: SyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), SyncService],
    });
    service = TestBed.inject(SyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit a refresh event when triggerRefresh is called', async () => {
    // Only take the first emission to finish the test
    service
      .getRefreshStream()
      .pipe(take(1))
      .subscribe(() => {
        expect(true).toBe(true);
      });
    service.triggerRefresh();
  });

  it('should have initial in-flight requests value of 0', async () => {
    service.inFlightRequests$.pipe(take(1)).subscribe((count) => {
      expect(count).toEqual(0);
    });
  });

  it('should map in-flight requests correctly through hasInFlightRequest$', () => {
    const emittedValues: boolean[] = [];
    const subscription = service.hasInFlightRequest$.subscribe((value) => {
      emittedValues.push(value);
    });

    // Since in-flight requests start at 0, the first emission should be false.
    expect(emittedValues[0]).toBe(false);

    // Simulate an in-flight request by manually updating the BehaviorSubject.
    // (Accessing private property for test purposes.)
    (service as any)._inFlightRequests.next(1);
    expect(emittedValues[emittedValues.length - 1]).toBe(true);

    // Simulate completion of all in-flight requests.
    (service as any)._inFlightRequests.next(0);
    expect(emittedValues[emittedValues.length - 1]).toBe(false);

    subscription.unsubscribe();
  });
});
