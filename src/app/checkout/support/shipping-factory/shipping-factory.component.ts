import {afterRenderEffect, Component, ComponentRef, inject, input, ViewChild, ViewContainerRef} from '@angular/core';
import {IngridComponent} from '~/app/checkout/shippings/ingrid/ingrid.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';


@Component({
  selector: 'app-shipping-factory',
  imports: [],
  template: `
    <ng-template #shippingContainer></ng-template>`,
})
export class ShippingFactoryComponent {
  adapterId = input<string>();
  private toastService = inject(ToastService);
  private adapters = inject<IAdapters>(ADAPTERS);

  private SHIPPING_COMPONENTS = {
    [this.adapters.shipping.Ingrid]: IngridComponent,
  } as const;
  private paymentAdapters = Object.values(this.adapters.payment);
  private shippingAdapters = Object.values(this.adapters.shipping);

  @ViewChild('shippingContainer', {read: ViewContainerRef}) container: ViewContainerRef | undefined;

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadShippingComponent(this.adapterId());
    });
  }

  private loadShippingComponent(adapterId?: string) {
    if (!adapterId) return;

    // Payments might provide shipping, so don't render them
    if (this.paymentAdapters.includes(adapterId as any)) return;

    this.clearContainer();

    const componentType = this.SHIPPING_COMPONENTS[adapterId as keyof typeof this.SHIPPING_COMPONENTS];
    if (!componentType) {
      this.toastService.error(`No shipping component registered for adapter ${adapterId}`);
      return;
    }

    if (!this.container) {
      this.toastService.error('No container to load shipping component into');
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
