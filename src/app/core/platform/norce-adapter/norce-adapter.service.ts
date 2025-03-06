import {inject, Injectable} from '@angular/core';
import {PlatformService} from '~/app/core/platform/platform.service';
import {Item} from '~/openapi/order';
import {DataService} from '~/app/core/platform/norce-adapter/data.service';
import {catchError, EMPTY, Observable, retry} from 'rxjs';
import {ContextService} from '~/app/core/context/context.service';
import {ToastService} from '~/app/core/toast/toast.service';

@Injectable()
export class NorceAdapterService extends PlatformService {
  private contextService = inject(ContextService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  updateItem(item: Item): Observable<void> {
    return this.dataService.updateItem(this.contextService.context()!, item.id!, item)
      .pipe(
        retry(1),
        catchError((error) => {
          this.toastService.error('Failed to update item');
          return EMPTY;
        }),
      )
  }

  removeItem(cartItem: Item): Observable<void> {
    return this.dataService.removeItem(this.contextService.context()!, cartItem.id!)
      .pipe(
        retry(1),
        catchError((error) => {
          this.toastService.error('Failed to remove item');
          return EMPTY;
        }),
      )
  }
}
