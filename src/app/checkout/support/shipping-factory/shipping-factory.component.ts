import {afterRenderEffect, Component, ComponentRef, input, ViewChild, ViewContainerRef} from '@angular/core';
import {Adapter} from '~/app/core/adapter';
import {IngridComponent} from '~/app/checkout/shippings/ingrid/ingrid.component';

const SHIPPING_COMPONENTS = {
  [Adapter.Ingrid]: IngridComponent,
} as const;

@Component({
  selector: 'app-shipping-factory',
  imports: [],
  template: `
    <ng-template #container></ng-template>`,
})
export class ShippingFactoryComponent {
  adapterId = input.required<string>();

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef | undefined;

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadShippingComponent(this.adapterId());
    });
  }

  private loadShippingComponent(adapterId: string) {
    this.clearContainer();

    const componentType = SHIPPING_COMPONENTS[adapterId as keyof typeof SHIPPING_COMPONENTS];
    if (!componentType) {
      console.error(`No shipping component registered for adapter: ${adapterId}`);
      return;
    }

    if (!this.container) {
      console.error('No container to load shipping component into');
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
