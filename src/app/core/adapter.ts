export const PaymentAdapter = {
  Walley: 'walley_checkout_adapter',
  Adyen: 'adyen_dropin_adapter',
} as const;
export type PaymentAdapter = typeof PaymentAdapter[keyof typeof PaymentAdapter];
export const PaymentAdapters = Object.values(PaymentAdapter);

export const ShippingAdapter = {
  Ingrid: 'ingrid_adapter'
} as const;
export type ShippingAdapter = typeof ShippingAdapter[keyof typeof ShippingAdapter];
export const ShippingAdapters = Object.values(ShippingAdapter);

export const Adapter = {
  ...PaymentAdapter,
  ...ShippingAdapter
} as const;
export type Adapter = typeof Adapter[keyof typeof Adapter];
