import {afterRenderEffect, Component, ComponentRef, input, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {Adapter} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';
import {
  FallbackConfirmationComponent
} from '~/app/checkout/support/fallback-confirmation/fallback-confirmation.component';

const CONFIRMATION_COMPONENTS = {
  [Adapter.Walley]: WalleyComponent,
} as const;

@Component({
  selector: 'app-confirmation-factory',
  imports: [],
  template: `
    <ng-template #container></ng-template>`,
})
export class ConfirmationFactoryComponent {
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

    let componentType: Type<any> = CONFIRMATION_COMPONENTS[adapterId as keyof typeof CONFIRMATION_COMPONENTS];
    if (!componentType) {
      componentType = FallbackConfirmationComponent;
    }

    if (!this.container) {
      console.error('No container to load confirmation component into');
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
