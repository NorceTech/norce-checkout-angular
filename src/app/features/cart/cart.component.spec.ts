import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import {
  provideExperimentalZonelessChangeDetection,
  signal,
} from '@angular/core';
import { CartService } from '~/app/features/cart/cart.service';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cartService = jasmine.createSpyObj(
      'CartService',
      ['items', 'updateItem$'],
      {
        items: signal([]),
        updateItem$: { next: jasmine.createSpy() },
      },
    );

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: CartService, useValue: cartService },
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
