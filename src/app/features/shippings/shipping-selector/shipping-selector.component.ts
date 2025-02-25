import {Component, computed, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {Card} from 'primeng/card';
import {SelectButton} from 'primeng/selectbutton';
import {SHIPPING_SERVICES} from '~/app/features/shippings/provide-shipping-services';
import {ConfigService} from '~/app/core/config/config.service';
import {OrderService} from '~/app/core/order/order.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {
  combineLatestWith,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  from,
  map,
  mergeMap,
  switchMap,
  take
} from 'rxjs';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';
import {IShippingService} from '~/app/features/shippings/shipping.service.interface';
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
  private adapters = inject<IAdapters>(ADAPTERS);
  private shippingServices = inject(SHIPPING_SERVICES)
  private configService = inject(ConfigService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);

  private shippingAdapters = Object.values(this.adapters.shipping || []);

  enabledShippingAdapters = computed(() => {
    const configs = this.configService.configs();
    if (!configs) return undefined;
    return configs
      .filter(config => {
        const isActive = config['active'] === true;
        const isShipping = this.shippingAdapters.includes(config.id);
        const hasShippingService = this.shippingServices.some(service => service.adapterId === config.id)
        if (isShipping && !hasShippingService) {
          this.toastService.warn(`Shipping service for ${config.id} is not available`);
        }
        return isActive && isShipping && hasShippingService;
      })
      .map(config => config.id)
  })

  selectedShippingAdapter$ = this.orderService.nonRemovedShippings$.pipe(
    map(shippings => shippings?.[0].adapterId || ''),
    distinctUntilChanged(),
  );

  constructor() {
    this.orderService.hasShipping$.pipe(
      take(1),
      filter(hasDefaultShipping => !hasDefaultShipping),
      switchMap(() => {
        const adapters = this.enabledShippingAdapters();
        if (!adapters) return EMPTY;

        const adapter = adapters[0];
        if (!adapter) {
          this.toastService.warn('No shipping adapter configured');
          return EMPTY;
        }

        const shippingService = this.shippingServices.find(service => service.adapterId === adapter);
        if (!shippingService) return EMPTY;
        return shippingService.createShipping();
      }),
      finalize(() => this.syncService.triggerRefresh()),
    ).subscribe()
  }

  private removeShippingUsingService(shippingSerice: IShippingService) {
    return this.orderService.nonRemovedShippings$.pipe(
      take(1),
      map(shippings => shippings.filter(shipping => shipping.adapterId === shippingSerice.adapterId)),
      mergeMap(shippings => from(shippings).pipe(
        switchMap(shipping => shippingSerice.removeShipping(shipping.id!)),
      ))
    )
  }

  createOrReplaceShippingByAdapterId(adapterId: string) {
    const currentShippingService = this.selectedShippingAdapter$.pipe(
      take(1),
      map(adapterId => this.shippingServices.find(service => service.adapterId === adapterId)!),
    )
    const nextShippingService = this.shippingServices.find(service => service.adapterId === adapterId)!;
    this.orderService.hasShipping$.pipe(
      take(1),
      combineLatestWith(currentShippingService),
      switchMap(([hasDefaultShipping, currentShippingService]) => {
        if (hasDefaultShipping) {
          return this.removeShippingUsingService(currentShippingService).pipe(
            switchMap(() => nextShippingService.createShipping()
            ));
        } else {
          return nextShippingService.createShipping();
        }
      }),
      finalize(() => this.syncService.triggerRefresh()),
    ).subscribe()
  }
}
