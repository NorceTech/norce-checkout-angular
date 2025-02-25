import {computed, Injectable, Signal} from '@angular/core';
import {Context} from '~/app/core/entities/Context';
import {environment} from '~/environments/environment';
import {injectQueryParams} from 'ngxtension/inject-query-params';
import {Params} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private queryParams: Signal<Params> = injectQueryParams();

  context = computed(() => {
    const qp = this.queryParams();
    const merchant: string | undefined = environment.context?.merchant || qp['merchant'];
    const channel: string | undefined = environment.context?.channel || qp['channel'];
    const orderId: string | undefined = qp['orderId'];

    if (!merchant || !channel || !orderId) {
      return undefined;
    }

    return new Context({
      merchant,
      channel,
      orderId
    });
  });
}
