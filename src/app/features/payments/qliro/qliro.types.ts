import type { QliroCheckoutShippingMethodChanged } from '~/openapi/qliro-adapter';

declare global {
  interface Window {
    q1Ready?: (q1: Q1) => void;
    q1?: Q1;
  }
}

export interface Q1 {
  lock(): void;
  unlock(): void;
  /**
   * Requires q1.lock() to have been called first. Initiates the order sync process towards the checkout frontend. Should call q1.unlock() as soon as the orders match.
   */
  onOrderUpdated(callback: (data: unknown) => void): void;
}

export interface Q1Listeners {
  /**
   * A callback for when Qliro Checkout is fully loaded, which is when the interface has loaded and the order has been successfully fetched from server.
   */
  onCheckoutLoaded(callback: () => void): void;
  /**
   * This callback activates when a customer updates their contact information (email, mobile number, address or personal/organization number).
   */
  onCustomerInfoChanged(callback: (data: unknown) => void): void;
  /**
   * This callback activates if a customer clicks the "Not you?" option, or chooses to re-authenticate using their personal number during checkout.
   */
  onCustomerDeauthenticating(callback: () => void): void;
  /**
   * Called when the user changes payment method or subtype. Use this for applying payment method based discounts.
   */
  onPaymentMethodChanged(
    callback: (data: Q1PaymentMethodChanged) => void,
  ): void;
  /**
   * If the customer tries to complete the purchase but the payment is declined.
   */
  onPaymentDeclined(
    callback: (declineReason: string, declineReasonMessage?: string) => void,
  ): void;
  /**
   * When the customer completes the purchase and checkout is processing the payment.
   */
  onPaymentProcess(onStart: () => void, onEnd: () => void): void;
  /**
   * If the authorization token expires during a session.
   */
  onSessionExpired(updateToken: () => void): void;
  /**
   * This callback is called when the customer changes shipping method, secondary option or additional shipping services.
   */
  onShippingMethodChanged(
    callback: (data: QliroCheckoutShippingMethodChanged) => void,
  ): void;
  /**
   * When the customer changes shipping option so that the shipping fee is affected.
   */
  onShippingPriceChanged(
    callback: (shippingPrice: number, totalShippingPrice: number) => void,
  ): void;
}

export interface Q1 extends Q1Listeners {}

export interface Q1PaymentMethodChanged {
  method: string;
  subtype: string;
  price: number;
  priceExVat: number;
}
