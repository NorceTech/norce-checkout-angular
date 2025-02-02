import {inject, Injectable} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {filter, map, pairwise, startWith} from 'rxjs';
import {Context} from '~/app/core/entities/Context';
import {ContextError, ContextErrorCode} from '~/app/core/entities/errors/ContextError';
import {environment} from '~/environments/environment';

const empty = Symbol('empty')

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private activatedRoute = inject(ActivatedRoute);

  context$ = this.activatedRoute.queryParams.pipe(
    startWith(empty),
    pairwise(),
    filter(pair => {
      const [prev, next] = pair as [typeof empty | Params, Params];
      if (prev === empty) return true;

      if (prev['orderId'] !== next['orderId']) return true;
      if (prev['channel'] !== next['channel']) return true;
      if (prev['merchant'] !== next['merchant']) return true;

      return false;
    }),
    map(([, next]) => next as Params),
    map(params => {
      const merchant: string | undefined = environment.context?.merchant || params['merchant'];
      const channel: string | undefined = environment.context?.['channel'] || params['channel'];
      const orderId: string | undefined = params['orderId'];

      if (!merchant || !channel || !orderId) {
        throw new ContextError(ContextErrorCode.ContextNotAvailable, 'merchant, channel and orderId are required');
      }
      return new Context({
        merchant,
        channel,
        orderId
      });
    })
  )
}
