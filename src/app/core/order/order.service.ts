import {inject, Injectable} from '@angular/core';
import {DataService} from '~/app/core/order/data.service';
import {catchError, EMPTY, mergeWith, Observable, retry, shareReplay, switchMap} from 'rxjs';
import {ToastService} from '~/app/core/toast/toast.service';
import {Order} from '~/openapi/order';
import {ContextService} from '~/app/core/context/context.service';
import {RefreshService} from '~/app/core/refresh/refresh.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private contextService = inject(ContextService);
  private refreshService = inject(RefreshService);

  getOrder(): Observable<Order> {
    return this.contextService.$context
      .pipe(
        mergeWith(
          this.refreshService.getRefreshStream().pipe(
            switchMap(() => this.contextService.$context)
          )
        ),
      )
      .pipe(
      switchMap(ctx => {
        return this.dataService.getOrder(ctx.orderId)
          .pipe(
            retry(2),
            catchError(() => {
              this.toastService.error('Failed to fetch order data');
              return EMPTY;
            })
          )
      }),
      shareReplay(1)
    )
  }
}
