import {Component, input, output} from '@angular/core';
import {Button} from "primeng/button";
import {Payment} from '~/openapi/order';
import {PricePipe} from '~/app/shared/pipes/price.pipe';

@Component({
  selector: 'app-awardit-list-vouchers',
  imports: [
    Button,
    PricePipe
  ],
  templateUrl: './awardit-list-vouchers.component.html',
  styleUrl: './awardit-list-vouchers.component.css'
})
export class AwarditListVouchersComponent {
  vouchers = input<Payment[]>([]);
  onDelete = output<Payment>();
}
