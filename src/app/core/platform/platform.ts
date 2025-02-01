import {Item} from '~/openapi/order';
import {Observable} from 'rxjs';

export abstract class PlatformAdapterService {
  abstract updateItem(cartItem: Item): Observable<void>;
}
