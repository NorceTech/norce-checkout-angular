import {Component, computed, inject} from '@angular/core';
import {Card} from 'primeng/card';
import {SelectButton} from 'primeng/selectbutton';
import {SHIPPING_SERVICES} from '~/app/features/shippings/provide-shipping-services';
import {ConfigService} from '~/app/core/config/config.service';
import {OrderService} from '~/app/core/order/order.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {EMPTY, filter, finalize, map, switchMap, take} from 'rxjs';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';
import {FormsModule} from '@angular/forms';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-shipping-selector',
  imports: [
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

  selectedShipping = computed(() => {
    return this.orderService.order()
      .shippings
      ?.find(shipping => shipping.state !== 'removed')
  });

  private hasShipping$ = toObservable(this.selectedShipping).pipe(
    map(selectedShipping => !!selectedShipping),
  );

  constructor() {
    this.hasShipping$.pipe(
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

  createOrReplaceShippingByAdapterId(adapterId: string) {
    const currentShippingService = this.shippingServices.find(service => service.adapterId === this.selectedShipping()?.adapterId);

    const nextShippingService = this.shippingServices.find(service => service.adapterId === adapterId)!;
    this.hasShipping$.pipe(
      take(1),
      switchMap(hasShipping => {
        if (hasShipping) {
          if (!currentShippingService) return EMPTY;
          return currentShippingService.removeShipping(this.selectedShipping()?.id!).pipe(
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
