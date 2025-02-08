import {
  afterRenderEffect,
  Component,
  ComponentRef,
  inject,
  input,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ADAPTERS} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';
import {
  FallbackConfirmationComponent
} from '~/app/checkout/support/fallback-confirmation/fallback-confirmation.component';
import {ToastService} from '~/app/core/toast/toast.service';


@Component({
  selector: 'app-confirmation-factory',
  imports: [],
  template: `
    <ng-template #container></ng-template>`,
})
export class ConfirmationFactoryComponent {
  adapterId = input<string>();
  private toastService = inject(ToastService);
  private adapters = inject(ADAPTERS);

  private CONFIRMATION_COMPONENTS = {
    [this.adapters.payment.Walley]: WalleyComponent,
  } as const;

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef | undefined;

  private componentRef?: ComponentRef<any>;

  constructor() {
    afterRenderEffect(() => {
      this.loadPaymentComponent(this.adapterId());
    });
  }

  private loadPaymentComponent(adapterId?: string) {
    if (!adapterId) return;
    this.clearContainer();

    let componentType: Type<any> = this.CONFIRMATION_COMPONENTS[adapterId as keyof typeof this.CONFIRMATION_COMPONENTS];
    if (!componentType) {
      componentType = FallbackConfirmationComponent;
    }

    if (!this.container) {
      this.toastService.error('No container to load confirmation component into');
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
