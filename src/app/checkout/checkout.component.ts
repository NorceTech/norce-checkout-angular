import {Component, inject} from '@angular/core';
import {ToastService} from '../core/toast/toast.service';
import {CartComponent} from '~/app/checkout/support/cart/cart.component';

@Component({
  selector: 'app-checkout',
  imports: [
    CartComponent
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private toastService = inject(ToastService);
}
