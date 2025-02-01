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
}
