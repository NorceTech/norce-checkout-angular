import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CreateOrderCommand,
  PlatformService,
} from '~/app/core/platform/platform.service';
import { Item } from '~/openapi/order';
import type { Error } from '~/openapi/norce-adapter';
import { DataService } from '~/app/core/platform/norce-adapter/data.service';
import { catchError, EMPTY, map, Observable, retry } from 'rxjs';
import { ContextService } from '~/app/core/context/context.service';
import { ToastService } from '~/app/core/toast/toast.service';
import { Context } from '../../entities/context';

@Injectable()
export class NorceAdapterService extends PlatformService {
  private contextService = inject(ContextService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  createOrder(command: CreateOrderCommand): Observable<Context> {
    return this.dataService
      .createOrder(
        command.merchant,
        command.channel,
        Number(command.cartReference),
        command.culture,
      )
      .pipe(
        map(
          (response) =>
            new Context({
              merchant: command.merchant,
              channel: command.channel,
              orderId: response.id,
            }),
        ),
        retry(1),
        catchError((error: HttpErrorResponse) => {
          const errorResponse = error.error as Error | undefined;
          this.toastService.error(
            errorResponse?.message ?? 'Failed to create order',
          );
          return EMPTY;
        }),
      );
  }

  updateItem(item: Item): Observable<void> {
    return this.dataService
      .updateItem(this.contextService.context()!, item.id!, item)
      .pipe(
        retry(1),
        catchError((error) => {
          this.toastService.error('Failed to update item');
          return EMPTY;
        }),
      );
  }

  removeItem(cartItem: Item): Observable<void> {
    return this.dataService
      .removeItem(this.contextService.context()!, cartItem.id!)
      .pipe(
        retry(1),
        catchError((error) => {
          this.toastService.error('Failed to remove item');
          return EMPTY;
        }),
      );
  }
}
