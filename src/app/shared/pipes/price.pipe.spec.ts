import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { PricePipe } from './price.pipe';
import { OrderService } from '~/app/core/order/order.service';
import { environment } from '~/environments/environment';
import { Price } from '~/openapi/order';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('PricePipe', () => {
  let pipe: PricePipe;
  let fakeOrderService: FakeOrderService;
  const originalShowPriceIncludingVat = environment.showPriceIncludingVat;
  const NBSP = '\u00A0'; // Non-breaking space

  class FakeOrderService {
    currency$ = new BehaviorSubject<string>('SEK');
    culture$ = new BehaviorSubject<string>('sv-SE');
  }

  beforeEach(() => {
    fakeOrderService = new FakeOrderService();

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        PricePipe,
        { provide: OrderService, useValue: fakeOrderService },
      ],
    });
    pipe = TestBed.inject(PricePipe);
  });

  afterEach(() => {
    // Restore original environment configuration
    environment.showPriceIncludingVat = originalShowPriceIncludingVat;
  });

  it('should format undefined as ZERO price', () => {
    const result = pipe.transform(undefined);
    const expected = `0,00${NBSP}kr`;
    expect(result).toBe(expected);
  });

  it('should format null as ZERO price', () => {
    const result = pipe.transform(null);
    const expected = `0,00${NBSP}kr`;
    expect(result).toBe(expected);
  });

  it('should format a numeric input as a Price object', () => {
    const value = 123;
    const result = pipe.transform(value);
    const expected = `123,00${NBSP}kr`;
    expect(result).toBe(expected);
  });

  it('should format a Price object using includingVat when showPriceIncludingVat is true', () => {
    environment.showPriceIncludingVat = true;
    const price: Price = { includingVat: 200, excludingVat: 150 };
    const result = pipe.transform(price);
    const expected = `200,00${NBSP}kr`;
    expect(result).toBe(expected);
  });

  it('should format a Price object using excludingVat when showPriceIncludingVat is false', () => {
    environment.showPriceIncludingVat = false;
    const price: Price = { includingVat: 200, excludingVat: 150 };
    const result = pipe.transform(price);
    const expected = `150,00${NBSP}kr`;
    expect(result).toBe(expected);
  });

  it('should update currency and culture when OrderService emits new values', () => {
    // Initially using the default "sv-SE" and "SEK"
    let result = pipe.transform(100);
    let expected = `100,00${NBSP}kr`;
    expect(result).toBe(expected);

    // Update OrderService values to use a different locale and currency
    fakeOrderService.currency$.next('USD');
    fakeOrderService.culture$.next('en-US');

    // Since BehaviorSubjects emit synchronously, the next call to transform should
    // reflect the updated values.
    result = pipe.transform(100);
    expected = '$100.00';
    expect(result).toBe(expected);
  });
});
