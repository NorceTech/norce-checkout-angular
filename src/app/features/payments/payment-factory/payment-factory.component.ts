import {afterRenderEffect, Component, ComponentRef, inject, input, viewChild, ViewContainerRef} from '@angular/core';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/features/payments/walley/walley.component';
import {AdyenComponent} from '~/app/features/payments/adyen/adyen.component';
import {KustomComponent} from '~/app/features/payments/kustom/kustom.component';
import {ToastService} from '~/app/core/toast/toast.service';

@Component({
  selector: 'app-payment-factory',
  imports: [],
  template: `
    <ng-template #paymentContainer></ng-template>`,
})
export class PaymentFactoryComponent {
  adapterId = input<string>();
  private toastService = inject(ToastService);
  private adapters = inject<IAdapters>(ADAPTERS);

  private PAYMENT_COMPONENTS = {
    [this.adapters.payment.Walley]: WalleyComponent,
    [this.adapters.payment.Adyen]: AdyenComponent,
    [this.adapters.payment.Kustom]: KustomComponent
  } as const;

  container = viewChild('paymentContainer', {read: ViewContainerRef});

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadComponent(this.adapterId());
    });
  }

  private loadComponent(adapterId?: string) {
    if (!adapterId) return;
    this.clearContainer();

    const componentType = this.PAYMENT_COMPONENTS[adapterId as keyof typeof this.PAYMENT_COMPONENTS];
    if (!componentType) {
      this.toastService.error(`No payment component registered for adapter: ${adapterId}`);
      return;
    }

    const container = this.container();
    if (!container) {
      this.toastService.error('No container to load payment component into');
      return;
    }
    container.clear();

    this.componentRef = container.createComponent(componentType as any);
  }

  private clearContainer() {
    this.container()?.clear();
    this.componentRef?.destroy();
    this.componentRef = undefined;
  }
}
