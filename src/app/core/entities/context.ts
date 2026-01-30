import { HttpHeaders } from '@angular/common/http';

interface IContext {
  merchant: string;
  channel: string;
  orderId: string;
}

export class Context {
  readonly merchant: string;
  readonly channel: string;
  readonly orderId: string;

  constructor(ctx: IContext) {
    this.merchant = ctx.merchant;
    this.channel = ctx.channel;
    this.orderId = ctx.orderId;
  }

  toHttpHeaders() {
    return new HttpHeaders({
      'x-merchant': this.merchant,
      'x-channel': this.channel,
      'x-order-id': this.orderId,
    });
  }

  toURLSearchParams() {
    return new URLSearchParams({
      merchant: this.merchant,
      channel: this.channel,
      orderId: this.orderId,
    });
  }

  equals(other: Context) {
    return (
      this.merchant === other.merchant &&
      this.channel === other.channel &&
      this.orderId === other.orderId
    );
  }
}
