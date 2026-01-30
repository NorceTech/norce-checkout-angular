import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SyncService } from '~/app/core/sync/sync.service';
import { finalize } from 'rxjs';

export const SHOULD_COUNT_REQUEST = new HttpContextToken(() => true);

export const syncInterceptor: HttpInterceptorFn = (req, next) => {
  const syncService = inject(SyncService);

  const shouldCount = req.context.get(SHOULD_COUNT_REQUEST);
  if (shouldCount) {
    syncService['_increment']();
  }
  return next(req).pipe(
    finalize(() => {
      if (shouldCount) {
        syncService['_decrement']();
      }
    }),
  );
};
