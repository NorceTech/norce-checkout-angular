import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private _refresh$ = new Subject<void>();

  triggerRefresh(): void {
    this._refresh$.next();
  }

  getRefreshStream(): Observable<void> {
    return this._refresh$.asObservable();
  }
}
