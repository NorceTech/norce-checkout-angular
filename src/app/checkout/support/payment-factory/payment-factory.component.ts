import {afterRenderEffect, Component, ComponentRef, inject, input, ViewChild, ViewContainerRef} from '@angular/core';
import {PaymentAdapter} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';
import {AdyenComponent} from '~/app/checkout/payments/adyen/adyen.component';
import {ToastService} from '~/app/core/toast/toast.service';

const PAYMENT_COMPONENTS = {
  [PaymentAdapter.Walley]: WalleyComponent,
  [PaymentAdapter.Adyen]: AdyenComponent
} as const;

@Component({
  selector: 'app-payment-factory',
  imports: [],
  template: `
    <ng-template #paymentContainer></ng-template>`,
})
export class PaymentFactoryComponent {
  adapterId = input<string>();
  private toastService = inject(ToastService);

  @ViewChild('paymentContainer', {read: ViewContainerRef}) container: ViewContainerRef | undefined;

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadPaymentComponent(this.adapterId());
    });
  }

  private loadPaymentComponent(adapterId?: string) {
    if (!adapterId) return;
    this.clearContainer();

    const componentType = PAYMENT_COMPONENTS[adapterId as keyof typeof PAYMENT_COMPONENTS];
    if (!componentType) {
      this.toastService.error(`No payment component registered for adapter: ${adapterId}`);
      return;
    }

    if (!this.container) {
      this.toastService.error('No container to load payment component into');
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
