export type WindowKlarna = {
  _klarnaCheckout?: KlarnaCheckoutApi | undefined;
};

export type KlarnaCheckoutApi = (
  callback: (api: KlarnaApi) => void
) => void;

export interface KlarnaApi {
  suspend: (options?: KlarnaSuspendOptions) => void;
  resume: () => void;
  on: (eventHandlers: KlarnaEventHandlers) => void;
}

export interface KlarnaSuspendOptions {
  autoResume?: {
    enabled: boolean;
  };
}

export enum KlarnaEvent {
  Load = 'load',
  UserInteracted = 'user_interacted',
  Customer = 'customer',
  Change = 'change',
  BillingAddressChange = 'billing_address_change',
  ShippingAddressChange = 'shipping_address_change',
  ShippingOptionChange = 'shipping_option_change',
  ShippingAddressUpdateError = 'shipping_address_update_error',
  OrderTotalChange = 'order_total_change',
  CheckboxChange = 'checkbox_change',
  CanNotCompleteOrder = 'can_not_complete_order',
  NetworkError = 'network_error',
  RedirectInitiated = 'redirect_initiated',
  LoadConfirmation = 'load_confirmation',
  ValidationCallback = 'validation_callback',
}

export interface KlarnaLoadEventData {
  customer: {
    type: 'person' | 'organization';
  };
  shipping_address: {
    country: string;
    postal_code: string;
  };
}

export interface KlarnaUserInteractedEventData {
  type: 'mousedown' | 'keydown';
}

export interface KlarnaCustomerEventData {
  type: 'person' | 'organization';
}

export interface KlarnaChangeEventData {
  email?: string;
  postal_code?: string;
  country?: string;
}

export interface KlarnaAddressChangeEventData {
  postal_code: string;
  country: string;
}

export interface KlarnaShippingOptionChangeEventData {
  description: string;
  id: string;
  name: string;
  price: number;
  promo?: string;
  tax_amount: number;
  tax_rate: number;
}

export interface KlarnaOrderTotalChangeEventData {
  order_total: number;
}

export interface KlarnaCheckboxChangeEventData {
  key: string;
  checked: boolean;
}

export interface KlarnaValidationCallbackData {
  callback: (result: KlarnaValidationCallbackResult) => void;
}

export interface KlarnaValidationCallbackResult {
  should_proceed: boolean;
  message?: string;
}

export type KlarnaEventHandlers = {
  [KlarnaEvent.Load]?: (data: KlarnaLoadEventData) => void;
  [KlarnaEvent.UserInteracted]?: (data: KlarnaUserInteractedEventData) => void;
  [KlarnaEvent.Customer]?: (data: KlarnaCustomerEventData) => void;
  [KlarnaEvent.Change]?: (data: KlarnaChangeEventData) => void;
  [KlarnaEvent.BillingAddressChange]?: (data: KlarnaAddressChangeEventData) => void;
  [KlarnaEvent.ShippingAddressChange]?: (data: KlarnaAddressChangeEventData) => void;
  [KlarnaEvent.ShippingOptionChange]?: (data: KlarnaShippingOptionChangeEventData) => void;
  [KlarnaEvent.ShippingAddressUpdateError]?: () => void;
  [KlarnaEvent.OrderTotalChange]?: (data: KlarnaOrderTotalChangeEventData) => void;
  [KlarnaEvent.CheckboxChange]?: (data: KlarnaCheckboxChangeEventData) => void;
  [KlarnaEvent.CanNotCompleteOrder]?: () => void;
  [KlarnaEvent.NetworkError]?: () => void;
  [KlarnaEvent.RedirectInitiated]?: () => void;
  [KlarnaEvent.LoadConfirmation]?: () => void;
  [KlarnaEvent.ValidationCallback]?: (data: never, callback: (result: KlarnaValidationCallbackResult) => void) => void;
};
