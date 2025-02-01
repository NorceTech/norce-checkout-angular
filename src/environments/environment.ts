export type Environment = {
  environment: 'development' | 'production';
  platform: 'norce',
  showPriceIncludingVat: boolean;
  apiSettings: {
    orderBaseUrl: string;
    platformBaseUrl: string;
  },
  context: {
    merchant: string | undefined;
    channel: string | undefined;
  } | undefined;
};

export const environment: Environment = {
  environment: 'production',
  platform: 'norce',
  showPriceIncludingVat: true,
  apiSettings: {
    orderBaseUrl: 'https://order.checkout.prod.internal.norce.tech',
    platformBaseUrl: 'https://norce-adapter.checkout.prod.internal.norce.tech'
  },
  context: {
    merchant: 'norcecheckouttest',
    channel: undefined
  }
};
