import { computed, inject, Pipe, PipeTransform } from '@angular/core';
import { Price } from '~/openapi/order';
import { OrderService } from '~/app/core/order/order.service';
import { environment } from '~/environments/environment';

const ZERO: Price = {
  includingVat: 0,
  excludingVat: 0,
};

@Pipe({
  name: 'price',
})
export class PricePipe implements PipeTransform {
  private orderService = inject(OrderService);
  private currency = computed(
    () => this.orderService.order().currency || 'SEK',
  );
  private culture = computed(
    () => this.orderService.order().culture || 'sv-SE',
  );

  transform(
    value?: Price | number | null | undefined,
    ...args: unknown[]
  ): string {
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
    const amount = environment.showPriceIncludingVat
      ? price.includingVat
      : price.excludingVat;
    return new Intl.NumberFormat(this.culture(), {
      style: 'currency',
      currency: this.currency(),
    }).format(amount || 0);
  }
}
