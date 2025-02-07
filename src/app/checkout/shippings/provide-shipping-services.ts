import {InjectionToken, Provider} from '@angular/core';
import {IPaymentService} from '~/app/checkout/payments/payment.service.interface';
import {IngridService} from '~/app/checkout/shippings/ingrid/ingrid.service';

export const SHIPPING_SERVICES =
  new InjectionToken<IPaymentService[]>('PAYMENT_ADAPTER');

export function provideShippingServices(): Provider {
  return [
    {
      provide: SHIPPING_SERVICES,
      useExisting: IngridService,
      multi: true,
    },
  ];
}
