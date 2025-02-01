import {inject, Pipe, PipeTransform} from '@angular/core';
import {Price} from '~/openapi/order';
import {OrderService} from '~/app/core/order/order.service';
import {environment} from '~/environments/environment';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

const ZERO: Price = {
  includingVat: 0,
  excludingVat: 0,
}

@Pipe({
  name: 'price'
})
export class PricePipe implements PipeTransform {
  private orderService = inject(OrderService);

  private currency = 'SEK';
  private culture = 'sv-SE';

  constructor() {
    this.orderService.currency$.pipe(
      takeUntilDestroyed()
    ).subscribe(currency => this.currency = currency);
    this.orderService.culture$.pipe(
      takeUntilDestroyed()
    ).subscribe(culture => this.culture = culture);
  }


  transform(value?: Price | number | null | undefined, ...args: unknown[]): string {
    if (!value) return this.formatPrice(ZERO);
    if (typeof value === 'number') {
      return this.formatPrice({
        includingVat: value,
        excludingVat: value,
      });
    }
    return this.formatPrice(value);
  }

  private formatPrice(price: Price): string {
    const amount = environment.showPriceIncludingVat ? price.includingVat : price.excludingVat;
    return new Intl.NumberFormat(this.culture, {
      style: 'currency',
      currency: this.currency,
    }).format(amount || 0);
  }
}
