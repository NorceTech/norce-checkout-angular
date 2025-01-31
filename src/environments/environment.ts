export type Environment = {
  environment: 'development' | 'production';
  apiSettings: {
    orderBaseUrl: string;
  }
};
export const environment: Environment = {
  environment: 'production',
  apiSettings: {
    orderBaseUrl: 'https://order.checkout.prod.internal.norce.tech'
  }
};
