import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import {
  provideExperimentalZonelessChangeDetection,
  signal,
} from '@angular/core';
import { CartService } from '~/app/features/cart/cart.service';
import { OrderService } from '~/app/core/order/order.service';
import { PricePipe } from '~/app/shared/pipes/price.pipe';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cartService = jasmine.createSpyObj('CartService', [], {
      items: signal([]),
      updateItem$: { next: jasmine.createSpy() },
    });

    const mockOrderService = {
      order: signal({
        currency: 'SEK',
        culture: 'sv-SE',
        payments: [],
        shippings: [],
      }),
    };

    const pricePipeSpy = jasmine.createSpyObj('PricePipe', ['transform']);
    pricePipeSpy.transform.and.returnValue('0,00 kr');

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
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
