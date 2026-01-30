import {afterRenderEffect, Component, ComponentRef, inject, input, viewChild, ViewContainerRef} from '@angular/core';
import {IngridComponent} from '~/app/features/shippings/ingrid/ingrid.component';
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
  private platformAdapters = Object.values(this.adapters.platform);
  private paymentAdapters = Object.values(this.adapters.payment);

  container = viewChild('shippingContainer', {read: ViewContainerRef});

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadComponent(this.adapterId());
    });
  }

  private loadComponent(adapterId?: string) {
    if (!adapterId) return;

    // Payments might provide shipping, so don't render them
    if (this.paymentAdapters.includes(adapterId as any)) return;
    // Just ignore if shipping is provided by platform
    if (this.platformAdapters.includes(adapterId as any)) return;

    this.clearContainer();

    const componentType = this.SHIPPING_COMPONENTS[adapterId as keyof typeof this.SHIPPING_COMPONENTS];
    if (!componentType) {
      this.toastService.error(`No shipping component registered for adapter ${adapterId}`);
      return;
    }

    const container = this.container();
    if (!container) {
      this.toastService.error('No container to load shipping component into');
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
