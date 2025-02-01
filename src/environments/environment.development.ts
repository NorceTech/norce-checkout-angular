/** @type {import('./environment').Environment} */
export const environment = {
  environment: 'development',
  platform: 'norce',
  apiSettings: {
    orderBaseUrl: 'https://order.checkout.test.internal.norce.tech',
    platformBaseUrl: 'https://norce-adapter.checkout.test.internal.norce.tech'
  },
  context: {
    merchant: 'norcecheckouttest',
    channel: undefined
  }
};
