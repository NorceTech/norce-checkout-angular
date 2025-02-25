import {computed, inject, Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Context} from '~/app/core/entities/Context';
import {environment} from '~/environments/environment';
import {injectQueryParams} from 'ngxtension/inject-query-params';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private activatedRoute = inject(ActivatedRoute);
  private queryParams = injectQueryParams();

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
