import { WindowIngrid } from '~/app/features/shippings/ingrid/ingrid.types';
import { WindowWalley } from '~/app/features/payments/walley/walley.types';

declare global {
  interface Window {
    _sw?: WindowIngrid['_sw'];
    walley?: WindowWalley['walley'];
  }
}
