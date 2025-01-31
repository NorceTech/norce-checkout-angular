import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {ToastService} from '../core/toast/toast.service';

@Component({
  selector: 'app-checkout',
  imports: [
    Button
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private toastService = inject(ToastService);
}
