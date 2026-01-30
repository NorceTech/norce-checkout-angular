import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { CartService } from '~/app/features/cart/cart.service';
import { OrderService } from '~/app/core/order/order.service';
import { PricePipe } from '~/app/shared/pipes/price.pipe';
import { Subject } from 'rxjs';
import { Item } from '~/openapi/order';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: Partial<CartService>;

  beforeEach(async () => {
    const mockUpdateItem$ = new Subject<Item>();
    cartService = {
      items: signal([]),
      updateItem$: mockUpdateItem$,
      removeItem$: new Subject<Item>(),
    };

    const mockOrderService = {
      order: signal({
        currency: 'SEK',
        culture: 'sv-SE',
        payments: [],
        shippings: [],
      }),
    };

    const pricePipeSpy = {
      transform: vi.fn().mockName('PricePipe.transform'),
    };
    pricePipeSpy.transform.mockReturnValue('0,00 kr');

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CartService, useValue: cartService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: PricePipe, useValue: pricePipeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
