import {afterRenderEffect, Component, ComponentRef, input, ViewChild, ViewContainerRef} from '@angular/core';
import {Adapter} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';

const PAYMENT_COMPONENTS = {
  [Adapter.Walley]: WalleyComponent
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

  private loadPaymentComponent(adapterId?: string) {
    this.clearContainer();

    const componentType = PAYMENT_COMPONENTS[adapterId as keyof typeof PAYMENT_COMPONENTS];
    if (!componentType) {
      console.error(`No component registered for payment adapter: ${adapterId}`);
      return;
    }

    if (!this.container) {
      console.error('No container to load payment component into');
      return;
    }
    this.container.clear();

    this.componentRef = this.container.createComponent(componentType);
  }

  private clearContainer() {
    this.container?.clear();
    this.componentRef?.destroy();
    this.componentRef = undefined;
  }
}
