import {WindowIngrid} from '~/app/checkout/shippings/ingrid/ingrid.types';
import {WindowWalley} from '~/app/checkout/payments/walley/walley.types';

declare global {
  interface Window {
    _sw?: WindowIngrid['_sw'];
    walley?: WindowWalley['walley'];
  }
}
