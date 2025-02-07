export type WindowWalley = {
  walley?: WalleyApi | undefined;
};

export interface WalleyApi {
  checkout: {
    api: {
      resume: (publicToken?: string) => void;
      suspend: (publicToken?: string) => void;
      update: (publicToken?: string) => void;
    };
  };
}

export enum WalleyEvent {
  CustomerUpdated = 'walleyCheckoutCustomerUpdated',
  OrderValidationFailed = 'walleyCheckoutOrderValidationFailed',
  Locked = 'walleyCheckoutLocked',
  Unlocked = 'walleyCheckoutUnlocked',
  ReloadedByUser = 'walleyCheckoutReloadedByUser',
  Expired = 'walleyCheckoutExpired',
  Resumed = 'walleyCheckoutResumed',
  PurchaseCompleted = 'walleyCheckoutPurchaseCompleted',
  ShippingUpdated = 'walleyCheckoutShippingUpdated',
}

export type WalleyEvents = {
  [WalleyEvent.CustomerUpdated]: {};
  [WalleyEvent.OrderValidationFailed]: {};
  [WalleyEvent.Locked]: {};
  [WalleyEvent.Unlocked]: {};
  [WalleyEvent.ReloadedByUser]: {};
  [WalleyEvent.Expired]: {};
  [WalleyEvent.Resumed]: {};
  [WalleyEvent.PurchaseCompleted]: {};
  [WalleyEvent.ShippingUpdated]: {};
};
