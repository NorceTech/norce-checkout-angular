import {Routes} from '@angular/router';
import {CheckoutLayoutComponent} from './layouts/checkout-layout/checkout-layout.component';

export const routes: Routes = [
  {
    path: "", component: CheckoutLayoutComponent, children: [
      {
        path: "newcheckout",
        redirectTo: (redirectData) => {
          const queryParams = new URLSearchParams(redirectData.queryParams);
          return `checkout?${queryParams.toString()}`;
        }
      },
      {
        path: "checkout",
        title: "Order | Norce Checkout",
        loadComponent: () => import('~/app/pages/checkout/checkout.component').then(c => c.CheckoutComponent)
      },
      {
        path: "confirmation",
        title: "Confirmation | Norce Checkout",
        loadComponent: () => import('~/app/pages/confirmation/confirmation.component').then(c => c.ConfirmationComponent)
      }
    ]
  }
];
