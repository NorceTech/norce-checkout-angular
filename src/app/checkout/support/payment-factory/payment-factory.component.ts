import {afterRenderEffect, Component, ComponentRef, input, ViewChild, ViewContainerRef} from '@angular/core';
import {Adapter} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';
import {AdyenComponent} from '~/app/checkout/payments/adyen/adyen.component';

const PAYMENT_COMPONENTS = {
  [Adapter.Walley]: WalleyComponent,
  [Adapter.Adyen]: AdyenComponent
} as const;

@Component({
  selector: 'app-payment-factory',
  imports: [],
  template: `
    <ng-template #container></ng-template>`,
})
export class PaymentFactoryComponent {
  adapterId = input.required<string>();

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef | undefined;

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadPaymentComponent(this.adapterId());
    });
  }

  private loadPaymentComponent(adapterId: string) {
    this.clearContainer();

    const componentType = PAYMENT_COMPONENTS[adapterId as keyof typeof PAYMENT_COMPONENTS];
    if (!componentType) {
      console.error(`No payment component registered for adapter: ${adapterId}`);
      return;
    }

    if (!this.container) {
      console.error('No container to load payment component into');
      return;
    }
    this.container.clear();

    this.componentRef = this.container.createComponent(componentType as any);
  }

  private clearContainer() {
    this.container?.clear();
    this.componentRef?.destroy();
    this.componentRef = undefined;
  }
}
