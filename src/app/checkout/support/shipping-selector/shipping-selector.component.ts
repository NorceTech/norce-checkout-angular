import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {Card} from 'primeng/card';
import {SelectButton} from 'primeng/selectbutton';
import {SHIPPING_SERVICES} from '~/app/checkout/shippings/provide-shipping-services';
import {ConfigService} from '~/app/core/config/config.service';
import {OrderService} from '~/app/core/order/order.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {
  distinctUntilChanged,
  filter,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  shareReplay,
  switchMap,
  take
} from 'rxjs';
import {ShippingAdapter, ShippingAdapters} from '~/app/core/adapter';
import {IShippingService} from '~/app/checkout/shippings/shipping.service.interface';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-shipping-selector',
  imports: [
    AsyncPipe,
    Card,
    SelectButton,
    FormsModule
  ],
  templateUrl: './shipping-selector.component.html',
})
export class ShippingSelectorComponent {
  private shippingServices = inject(SHIPPING_SERVICES)
  private configService = inject(ConfigService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);

  enabledShippingAdapters$: Observable<ShippingAdapter[]> = this.configService.getConfigs().pipe(
    map(configs => {
      return configs
        .filter(config => {
          const isActive = config['active'] === true;
          const isShipping = ShippingAdapters.includes(config.id as ShippingAdapter);
          const hasShippingService = this.shippingServices.some(service => service.adapterId === config.id)
          if (isShipping && !hasShippingService) {
            this.toastService.warn(`Shipping service for ${config.id} is not available`);
          }
          return isActive && isShipping && hasShippingService;
        })
        .map(config => config.id as ShippingAdapter)
    }),
    shareReplay(1)
  );

  selectedShippingAdapter$ = this.orderService.nonRemovedShippings$.pipe(
    map(shippings => shippings?.[0].adapterId || ''),
    distinctUntilChanged(),
  );

  constructor() {
    this.orderService.hasShipping$.pipe(
      filter(hasDefaultShipping => !hasDefaultShipping),
      switchMap(() => {
        return this.enabledShippingAdapters$.pipe(
          take(1),
          map(adapters => adapters[0]),
          switchMap(adapter => {
            const shippingService = this.shippingServices.find(service => service.adapterId === adapter)!;
            return this.createShippingUsingService(shippingService);
          })
        )
      }),
      take(1),
      finalize(() => this.syncService.triggerRefresh()),
    ).subscribe()
  }

  private createShippingUsingService(shippingSerice: IShippingService) {
    return this.orderService.order$.pipe(
      map(order => order.id),
      switchMap(orderId => shippingSerice.createShipping(orderId!)),
    )
  }

  private removeShippingUsingService(shippingSerice: IShippingService) {
    return this.orderService.order$.pipe(
      map(order => order.id),
      switchMap(orderId => {
        return this.orderService.nonRemovedShippings$.pipe(
          map(shippings => shippings.filter(shipping => shipping.adapterId === shippingSerice.adapterId)),
          mergeMap(shippings => from(shippings).pipe(
            switchMap(shipping => shippingSerice.removeShipping(orderId!, shipping.id!)),
          )),
        )
      }),
    )
  }

  createOrReplaceShippingByAdapterId(shippingId: string) {
    const shippingService = this.shippingServices.find(service => service.adapterId === shippingId)!;
    this.orderService.hasShipping$.pipe(
      switchMap(hasDefaultShipping => {
        if (hasDefaultShipping) {
          return this.removeShippingUsingService(shippingService).pipe(
            switchMap(() => this.createShippingUsingService(shippingService)
            ));
        } else {
          return this.createShippingUsingService(shippingService);
        }
      }),
      take(1),
      finalize(() => this.syncService.triggerRefresh()),
    ).subscribe()
  }
}
