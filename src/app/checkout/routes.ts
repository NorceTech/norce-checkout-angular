import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: "checkout",
    title: "Order | Norce Checkout",
    loadComponent: () => import('./pages/checkout/checkout.component').then(c => c.CheckoutComponent)
  },
  {
    path: "confirmation",
    title: "Confirmation | Norce Checkout",
    loadComponent: () => import('~/app/checkout/pages/confirmation/confirmation.component').then(c => c.ConfirmationComponent)
  }
];
