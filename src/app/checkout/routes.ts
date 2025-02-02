import {Routes} from '@angular/router';
import {CheckoutComponent} from './pages/checkout/checkout.component';
import {ConfirmationComponent} from '~/app/checkout/pages/confirmation/confirmation.component';

export const routes: Routes = [
  {path: "checkout", title: "Order | Norce Checkout", component: CheckoutComponent},
  {path: "confirmation", title: "Confirmation | Norce Checkout", component: ConfirmationComponent}
];
