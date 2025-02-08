import {InjectionToken, Provider} from '@angular/core';
import {IngridService} from '~/app/checkout/shippings/ingrid/ingrid.service';
import {IShippingService} from '~/app/checkout/shippings/shipping.service.interface';

export const SHIPPING_SERVICES =
  new InjectionToken<IShippingService[]>('PAYMENT_ADAPTER');

export function provideShippingServices(): Provider {
  return [
    {
      provide: SHIPPING_SERVICES,
      useExisting: IngridService,
      multi: true,
    },
  ];
}
