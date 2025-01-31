import {Routes} from '@angular/router';
import {CheckoutLayoutComponent} from './layouts/checkout-layout/checkout-layout.component';
import {routes as CheckoutRoutes} from './checkout/routes';

export const routes: Routes = [
  {path: "checkout", component: CheckoutLayoutComponent, children: CheckoutRoutes}
];
