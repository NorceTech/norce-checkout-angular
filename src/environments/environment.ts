export type Environment = {
  environment: 'development' | 'production';
  platform: 'norce',
  showPriceIncludingVat: boolean;
  context: {
    merchant: string | undefined;
    channel: string | undefined;
  } | undefined;
};

export const environment: Environment = {
  environment: 'production',
  platform: 'norce',
  showPriceIncludingVat: true,
  context: {
    merchant: 'order-demo',
    channel: undefined
  }
};
