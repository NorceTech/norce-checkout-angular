import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { Item } from '~/openapi/order';
import { PricePipe } from '~/app/shared/pipes/price.pipe';
import { CartService } from '~/app/features/cart/cart.service';
import { CartSummaryComponent } from '~/app/features/cart/cart-summary/cart-summary.component';

@Component({
  selector: 'app-cart',
  imports: [
    FormsModule,
    TableModule,
    InputNumberModule,
    PricePipe,
    CartSummaryComponent,
  ],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private cartService = inject(CartService);

  items = this.cartService.items;

  onChange(item: Item, quantity: number) {
    const newItem = { ...item, quantity };
    newItem.total = {
      includingVat: newItem.price!.includingVat! * quantity,
      excludingVat: newItem.price!.excludingVat! * quantity,
    };
    this.cartService.updateItem$.next(newItem);
  }
}
