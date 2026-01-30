import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private _refresh$ = new Subject<void>();

  private _inFlightRequests = new BehaviorSubject<number>(0);
  inFlightRequests$ = this._inFlightRequests.asObservable();
  hasInFlightRequest$ = this._inFlightRequests.pipe(
    map((requests) => requests > 0),
  );

  /**
   * Manually increments the count of in-flight requests.
   * You _must_ make sure to have a matching `_resume()` call for every `_suspend()` call.
   */
  _suspend() {
    this._inFlightRequests.next(this._inFlightRequests.value + 1);
  }

  /**
   * Manually decrements the count of in-flight requests.
   */
  _resume() {
    this._inFlightRequests.next(this._inFlightRequests.value - 1);
  }

  triggerRefresh(): void {
    this._refresh$.next();
  }

  getRefreshStream(): Observable<void> {
    return this._refresh$;
  }
}
