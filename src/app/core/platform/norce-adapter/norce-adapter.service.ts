import {inject, Injectable} from '@angular/core';
import {PlatformAdapterService} from '~/app/core/platform/platform';
import {Item} from '~/openapi/order';
import {DataService} from '~/app/core/platform/norce-adapter/data.service';
import {catchError, EMPTY, Observable, retry, switchMap, tap} from 'rxjs';
import {ContextService} from '~/app/core/context/context.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {RefreshService} from '~/app/core/refresh/refresh.service';

@Injectable()
export class NorceAdapterService extends PlatformAdapterService {
  private contextService = inject(ContextService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private refreshService = inject(RefreshService);

  updateItem(item: Item): Observable<void> {
    return this.contextService.$context.pipe(
      switchMap(ctx => {
        return this.dataService.updateItem(ctx.orderId, item.id!, item)
          .pipe(
            retry(1),
            catchError(() => {
              this.toastService.error('Failed to update item');
              return EMPTY;
            }),
            tap(() => this.refreshService.triggerRefresh())
          )
      })
    )
  }
}
