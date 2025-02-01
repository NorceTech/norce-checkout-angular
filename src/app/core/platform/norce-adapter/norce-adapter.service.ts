import {inject, Injectable} from '@angular/core';
import {PlatformAdapterService} from '~/app/core/platform/platform';
import {Item} from '~/openapi/order';
import {DataService} from '~/app/core/platform/norce-adapter/data.service';
import {catchError, EMPTY, finalize, Observable, retry, switchMap, take} from 'rxjs';
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
        return this.dataService.updateItem(ctx, item.id!, item)
          .pipe(
            retry(1),
            catchError((error) => {
              this.toastService.error('Failed to update item');
              return EMPTY;
            }),
            finalize(() => this.refreshService.triggerRefresh())
          )
      })
    ).pipe(
      take(1)
    )
  }
}
