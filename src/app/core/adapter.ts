import {InjectionToken} from '@angular/core';

const ShippingAdapter = {
  Ingrid: 'ingrid_adapter',
} as const;

const VoucherAdapter = {
  Awardit: 'awardit_adapter',
} as const;

const PaymentAdapter = {
  Walley: 'walley_checkout_adapter',
  Adyen: 'adyen_dropin_adapter',
} as const;

export interface IAdapters {
  shipping: typeof ShippingAdapter & Record<string, string>;
  voucher: typeof VoucherAdapter & Record<string, string>;
  payment: typeof PaymentAdapter & Record<string, string>;
}

export const ADAPTERS =
  new InjectionToken<IAdapters>('ADAPTERS', {
    providedIn: 'root',
    factory: () => ({
      shipping: ShippingAdapter,
      voucher: VoucherAdapter,
      payment: PaymentAdapter,
    }),
  });
