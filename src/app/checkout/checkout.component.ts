import {Component, inject} from '@angular/core';
import {ToastService} from '../core/toast/toast.service';
import {CartComponent} from '~/app/checkout/support/cart/cart.component';
import {SummaryComponent} from '~/app/checkout/support/summary/summary.component';
import {Card} from 'primeng/card';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';

@Component({
  selector: 'app-checkout',
  imports: [
    CartComponent,
    SummaryComponent,
    Card,
    WalleyComponent
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private toastService = inject(ToastService);
}
