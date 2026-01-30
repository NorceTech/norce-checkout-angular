import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {environment} from '~/environments/environment';

@Component({
  selector: 'app-checkout-layout',
  imports: [
    RouterOutlet
  ],
  templateUrl: './checkout-layout.component.html',
})
export class CheckoutLayoutComponent {
  environment = environment.environment;
}
