import {Routes} from '@angular/router';
import {CheckoutLayoutComponent} from './layouts/checkout-layout/checkout-layout.component';

export const routes: Routes = [
  {
    path: "", component: CheckoutLayoutComponent, children: [
      // Ignore these redirects - they are used to test this easier in our internal systems
      {
        path: "newcheckout",
        redirectTo: (redirectData) => {
          const queryParams = new URLSearchParams(redirectData.queryParams);
          return `checkout?${queryParams.toString()}`;
        }
      },
      {
        path: "neworderconfirmation",
        redirectTo: (redirectData) => {
          const queryParams = new URLSearchParams(redirectData.queryParams);
          return `confirmation?${queryParams.toString()}`;
        }
      },
      {
        path: "",
        title: "Create Order Helper | Norce Checkout",
        loadComponent: () => import('~/app/pages/create-order/create-order.component').then(c => c.CreateOrderComponent)
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
