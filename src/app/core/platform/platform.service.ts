import {Item} from '~/openapi/order';
import {Observable} from 'rxjs';
import {Context} from '~/app/core/entities/context';

export type CreateOrderCommand = {
  merchant: string;
  channel: string;
  cartReference: string;
  culture: string;
};

export abstract class PlatformService {
  abstract updateItem(cartItem: Item): Observable<void>;

  abstract removeItem(cartItem: Item): Observable<void>;

  abstract createOrder(command: CreateOrderCommand): Observable<Context>;
}
