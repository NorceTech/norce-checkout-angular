import { Component, computed, inject, signal, untracked } from '@angular/core';
import { Card } from 'primeng/card';
import { SelectButton } from 'primeng/selectbutton';
import { SHIPPING_SERVICES } from '~/app/features/shippings/provide-shipping-services';
import { ConfigService } from '~/app/core/config/config.service';
import { OrderService } from '~/app/core/order/order.service';
import { ToastService } from '~/app/core/toast/toast.service';
import { SyncService } from '~/app/core/sync/sync.service';
import { EMPTY, Subject, switchMap } from 'rxjs';
import { ADAPTERS } from '~/app/core/adapter';
import { FormsModule } from '@angular/forms';
import { Shipping } from '~/openapi/order';
import { connect } from 'ngxtension/connect';
import { effectOnceIf } from 'ngxtension/effect-once-if';

@Component({
  selector: 'app-shipping-selector',
  imports: [Card, SelectButton, FormsModule],
  templateUrl: './shipping-selector.component.html',
})
export class ShippingSelectorComponent {
  private shippingService = inject(SHIPPING_SERVICES);
  private configService = inject(ConfigService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);
  private adapters = inject(ADAPTERS);
  private shippingAdapters = Object.values(this.adapters.shipping || []);

  useShippingAdapter$ = new Subject<string>();

  private state = signal({
    currentShipping: null as Shipping | null,
    enabledShippings: null as string[] | null,
  });
  currentShipping = computed(() => this.state().currentShipping);
  enabledShippings = computed(() => this.state().enabledShippings);

  constructor() {
    connect(this.state)
      .with(() => {
        const state = untracked(() => this.state());
        const configs = this.configService.configs();
        if (!configs) return untracked(() => state);

        const enabledShippings = configs
          .filter((config) => {
            const isActive = config['active'] === true;
            const isShipping = this.shippingAdapters.includes(config.id);
            const hasService = this.shippingService.some(
              (service) => service.adapterId === config.id,
            );
            if (isShipping && !hasService) {
              this.toastService.warn(
                `Shipping service for ${config.id} is not available`,
              );
            }
            return isActive && isShipping && hasService;
          })
          .map((config) => config.id);

        return {
          ...state,
          enabledShippings: enabledShippings,
        };
      })
      .with(() => {
        const state = untracked(() => this.state());
        const shipping = this.orderService
          .order()
          ?.shippings?.find((shipping) => shipping.state !== 'removed');

        if (!shipping) return state;

        return {
          ...state,
          currentShipping: shipping,
        };
      });

    this.useShippingAdapter$
      .pipe(
        switchMap((adapterId) => {
          const enabledShippings = this.state().enabledShippings;
          if (!enabledShippings) return EMPTY;
          if (!enabledShippings.includes(adapterId)) {
            this.toastService.error(
              `Shipping service for ${adapterId} is not available`,
            );
            return EMPTY;
          }

          const currentShipping = this.currentShipping();
          const currentShippingService = this.shippingService.find(
            (service) => service.adapterId === currentShipping?.adapterId,
          );
          const nextShippingService = this.shippingService.find(
            (service) => service.adapterId === adapterId,
          )!;
          if (currentShippingService) {
            return currentShippingService
              .removeShipping(currentShipping!.id!)
              .pipe(switchMap(() => nextShippingService.createShipping()));
          } else {
            return nextShippingService.createShipping();
          }
        }),
      )
      .subscribe(() => this.syncService.triggerRefresh());

    effectOnceIf(
      () => {
        const order = this.orderService.order();
        const hasOrderLoaded = order?.id !== undefined;
        return (
          !this.currentShipping() &&
          this.enabledShippings()?.length! > 0 &&
          hasOrderLoaded
        );
      },
      () => {
        const adapterId = this.enabledShippings()![0];
        console.log('ShippingSelectorComponent: effectOnceIf', adapterId);
        this.useShippingAdapter$.next(adapterId);
      },
    );
  }
}
