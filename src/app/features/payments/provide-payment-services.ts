import {InjectionToken, Provider} from '@angular/core';
import {IPaymentService} from '~/app/features/payments/payment.service.interface';
import {AdyenService} from '~/app/features/payments/adyen/adyen.service';
import {WalleyService} from '~/app/features/payments/walley/walley.service';

export const PAYMENT_SERVICES =
  new InjectionToken<IPaymentService[]>('PAYMENT_ADAPTER');

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
