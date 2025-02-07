import {InjectionToken, Provider} from '@angular/core';
import {PaymentAdapterService} from '~/app/checkout/payments/payment.service.interface';
import {AdyenService} from '~/app/checkout/payments/adyen/adyen.service';
import {WalleyService} from '~/app/checkout/payments/walley/walley.service';

export const PAYMENT_SERVICES =
  new InjectionToken<PaymentAdapterService[]>('PAYMENT_ADAPTER');

export function providePaymentServices(): Provider {
  return [
    {
      provide: PAYMENT_SERVICES,
      useExisting: AdyenService,
      multi: true,
    },
    {
      provide: PAYMENT_SERVICES,
      useExisting: WalleyService,
      multi: true,
    }
  ];
}
