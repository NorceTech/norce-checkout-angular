export type Environment = {
  environment: 'playground' | 'prod';
  platform: 'norce',
  showPriceIncludingVat: boolean;
  context: {
    merchant: string | undefined;
    channel: string | undefined;
  } | undefined;
};

export const environment: Environment = {
  environment: 'prod',
  platform: 'norce',
  showPriceIncludingVat: true,
  context: {
    merchant: 'order-demo',
    channel: undefined
  }
};
