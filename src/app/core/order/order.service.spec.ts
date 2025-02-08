import {BehaviorSubject, of, Subject} from 'rxjs';
import {OrderService} from './order.service';
import {DataService} from '~/app/core/order/data.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {TestBed} from '@angular/core/testing';
import {ContextService} from '~/app/core/context/context.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {Order} from '~/openapi/order';
import {VoucherAdapter} from '~/app/core/adapter';
import {provideExperimentalZonelessChangeDetection} from '@angular/core';
import {Context} from '~/app/core/entities/Context';

const mockOrderFixture = {
  id: 'oSiRRhDR',
  merchant: 'norcecheckouttest',
  channel: 'norce-checkout-se-adyen-awardit-ingrid-address-form',
  created: '2025-02-07T10:13:33.1505376Z',
  lastModified: '2025-02-07T11:56:31.2325447Z',
  state: {
    currentStatus: 'accepted',
    transitions: [
      {status: 'checkout', timeStamp: '2025-02-07T10:13:32.9938578Z'},
      {status: 'processing', timeStamp: '2025-02-07T11:56:27.5820551Z'},
      {status: 'accepted', timeStamp: '2025-02-07T11:56:30.2539233Z'}
    ]
  },
  culture: 'sv-SE',
  currency: 'SEK',
  country: 'SE',
  cart: {
    reference: '49651',
    items: [
      {
        id: 'cidHaZyNyGqppBAFdjLKJeuZeeHd',
        reference: '144104',
        name: 'Hoodie',
        sku: '100023',
        productType: 'physical',
        url:
          'https://admin.commerce.test.internal.norce.tech/product/detail/144104',
        imageUrl:
          'https://norcecheckouttest.test.cdn-norce.tech/d51a4081-5770-43f2-a3d3-1bdb258eb513?w=200&h=200&mode=crop',
        quantity: 15,
        price: {includingVat: 375, excludingVat: 300},
        total: {includingVat: 5625, excludingVat: 4500},
        originalTotal: {includingVat: 5625, excludingVat: 4500},
        vatRate: 0.25,
        discounts: [],
        attributes: {priceListId: 29, currencyId: 2, lineNo: 1}
      }
    ],
    discounts: [],
    total: {includingVat: 5625, excludingVat: 4500},
    attributes: {currencyId: 2}
  },
  shippings: [
    {
      id: 'sAVlyDgCVdnHHhUwomLzzenrbXZ',
      state: 'intent',
      reference: 'VM2-a45083f0d44e4f2db1e1e2de4f517620',
      tmsReference: '01JKG49GQVWEAV4J9183W2D29M',
      orderId: 'oSiRRhDR',
      adapterId: 'ingrid_adapter',
      name: 'Ingrid',
      total: {includingVat: 40, excludingVat: 40},
      vatRate: 0,
      deliveryDetails: {
        carrier: 'Instabox',
        class: 'pickup',
        product: {
          reference:
            'postnord-mypack-collect-1df39eec78764480b100dbb20f461d17',
          name: 'Hämta från ombud/box'
        },
        pickupLocation: {
          reference: 'GB357',
          name: 'Stampen Hemmakväll',
          address: {
            streetAddress: 'Odinsplatsen 9',
            city: 'Gothenburg',
            postalCode: '41103',
            country: 'SE'
          }
        }
      },
      attributes: {
        shippingData: '{...}' // trimmed for brevity
      }
    }
  ],
  payments: [
    {
      id: 'pUEdkBauqnrWKEJDJnBEpZuNWEP',
      adapterId: 'adyen_dropin_adapter',
      name: 'Adyen Drop-in',
      currency: 'SEK',
      type: 'default',
      orderId: 'oSiRRhDR',
      amount: 3270,
      upperLimitAmount: 2147483647,
      state: 'reserved',
      reference: 'F764ZH8LBJ6QGS65',
      attributes: {
        clientId: 'JetshopAB_NorceCheckoutDemoB2CSweden_TEST',
        paymentName: ''
      }
    },
    {
      id: 'pWTnkVxRcByLkdOpUOmQseVYHTx',
      adapterId: 'awardit_adapter',
      name: 'Awardit',
      currency: 'SEK',
      type: 'voucher',
      orderId: 'oSiRRhDR',
      amount: 2395,
      upperLimitAmount: 2395,
      state: 'reserved',
      reference: '0128694142354031',
      attributes: {
        code: '35050',
        authorizationId: 'a3af79fb-1d2f-47d5-be0c-000000103365'
      }
    }
  ],
  customer: {
    billing: {
      type: 'person',
      givenName: 'Test',
      familyName: 'Testsson',
      streetAddress: 'Stampgatan 14',
      postalCode: '41101',
      city: 'Göteborg',
      country: 'SE',
      phone: '+46700112233',
      email: 'checkout-test@norce.io'
    },
    shipping: {
      type: 'person',
      givenName: 'Test',
      familyName: 'Testsson',
      streetAddress: 'Stampgatan 14',
      postalCode: '41101',
      city: 'Göteborg',
      country: 'SE',
      phone: '+46700112233',
      email: 'checkout-test@norce.io'
    },
    type: 'person'
  },
  consents: [],
  validations: [],
  hooks: [],
  notifications: [],
  total: {includingVat: 5665, excludingVat: 4540}
} satisfies Order;
const mockOrderModified = {
  ...mockOrderFixture,
  lastModified: '2025-02-07T12:00:00Z'
};

describe('OrderService', () => {
  let service: OrderService;
  let contextSubject: BehaviorSubject<Context>;
  let refreshSubject: Subject<void>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let context = new Context({
    orderId: mockOrderFixture.id!,
    merchant: mockOrderFixture.merchant,
    channel: mockOrderFixture.channel
  });

  beforeEach(() => {
    contextSubject = new BehaviorSubject<Context>(context);
    refreshSubject = new Subject<void>();

    const dataSpy = jasmine.createSpyObj('DataService', ['getOrder']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['error']);

    const contextServiceStub = {
      context$: contextSubject.asObservable()
    };

    const syncServiceStub = {
      getRefreshStream: () => refreshSubject.asObservable()
    };

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        OrderService,
        {provide: DataService, useValue: dataSpy},
        {provide: ToastService, useValue: toastSpy},
        {provide: ContextService, useValue: contextServiceStub},
        {provide: SyncService, useValue: syncServiceStub}
      ]
    });

    service = TestBed.inject(OrderService);
    dataServiceSpy = TestBed.inject(
      DataService
    ) as jasmine.SpyObj<DataService>;
    toastServiceSpy = TestBed.inject(
      ToastService
    ) as jasmine.SpyObj<ToastService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch order based on context', (done) => {
    dataServiceSpy.getOrder.and.returnValue(of(mockOrderFixture));

    service.order$.subscribe((order) => {
      expect(order).toEqual(mockOrderFixture);
      expect(dataServiceSpy.getOrder).toHaveBeenCalledWith('oSiRRhDR');
      done();
    });
  });

  it('should only emit updated orders when lastModified changes', (done) => {
    let callCount = 0;
    dataServiceSpy.getOrder.and.callFake(() => {
      callCount += 1;
      switch (callCount) {
        case 1:
        case 2:
          return of(mockOrderFixture);
        default:
          return of(mockOrderModified);
      }
    });

    const orders: any[] = [];
    const subscription = service.order$.subscribe((order) =>
      orders.push(order)
    );

    // Emit a new context (same orderId) four times.
    contextSubject.next(context);
    contextSubject.next(context);
    contextSubject.next(context);
    contextSubject.next(context);

    setTimeout(() => {
      // Expect two distinct emissions.
      expect(orders.length).toEqual(2);
      expect(orders[0]).toEqual(mockOrderFixture);
      expect(orders[1]).toEqual(mockOrderModified);
      subscription.unsubscribe();
      done();
    }, 0);
  });

  it('should refresh the order when sync refresh is triggered', (done) => {
    dataServiceSpy.getOrder.and.returnValues(
      of(mockOrderFixture),
      of(mockOrderModified)
    );

    const orders: any[] = [];
    const subscription = service.order$.subscribe((order) =>
      orders.push(order)
    );

    setTimeout(() => {
      expect(orders[0]).toEqual(mockOrderFixture);

      // Trigger a refresh event.
      refreshSubject.next();

      setTimeout(() => {
        expect(orders[1]).toEqual(mockOrderModified);
        expect(dataServiceSpy.getOrder.calls.count()).toEqual(2);
        subscription.unsubscribe();
        done();
      }, 0);
    }, 0);
  });

  it('should derive currency correctly', (done) => {
    dataServiceSpy.getOrder.and.returnValue(of({
      ...mockOrderFixture,
      currency: 'SEK'
    }));

    service.currency$.subscribe((currency) => {
      expect(currency).toEqual('SEK');
      done();
    });
  });

  it('should derive culture correctly', (done) => {
    dataServiceSpy.getOrder.and.returnValue(of({
      ...mockOrderFixture,
      culture: 'sv-SE'
    }));

    service.culture$.subscribe((culture) => {
      expect(culture).toEqual('sv-SE');
      done();
    });
  });

  it('should filter out removed shippings and determine hasShipping', (done) => {
    const shipping = mockOrderFixture.shippings[0];
    const mockOrderWithRemovedShipping: Order = {
      ...mockOrderFixture,
      shippings: [
        {...shipping, state: 'removed'},
        {...shipping, state: 'intent'}
      ]
    };
    dataServiceSpy.getOrder.and.returnValue(of(mockOrderWithRemovedShipping));

    service.nonRemovedShippings$.subscribe((shippings) => {
      // The fixture has one shipping with state "intent" (non‑removed).
      expect(shippings.length).toEqual(1);
      expect(shippings[0].state).toEqual('intent');
      done();
    });

    service.hasShipping$.subscribe((hasShipping) => {
      expect(hasShipping).toBeTrue();
    });
  });

  it('should derive default payment and hasDefaultPayment', (done) => {
    const payment = mockOrderFixture.payments[0];
    const mockOrderWithRemovedPayment: Order = {
      ...mockOrderFixture,
      payments: [
        {...payment, state: 'intent', type: 'voucher'},
        {...payment, state: 'removed', type: 'default'},
        {...payment, state: 'intent', type: 'default'},
      ]
    };
    dataServiceSpy.getOrder.and.returnValue(of(mockOrderWithRemovedPayment));

    service.defaultPayment$.subscribe((defaultPayment) => {
      expect(defaultPayment?.type).toEqual('default');
      expect(defaultPayment?.state).toEqual('intent');
      done();
    });

    service.hasDefaultPayment$.subscribe((hasDefault) => {
      expect(hasDefault).toBeTrue();
    });
  });

  it('getPayment should return the payment matching the provided adapter', (done) => {
    const payment = mockOrderFixture.payments[1];
    const mockOrder: Order = {
      ...mockOrderFixture,
      payments: [
        {...payment, type: 'voucher', state: 'removed', adapterId: VoucherAdapter.Awardit},
        {...payment, type: 'voucher', state: 'intent', adapterId: VoucherAdapter.Awardit},
      ]
    }
    dataServiceSpy.getOrder.and.returnValue(of(mockOrder));

    service.getPayment(VoucherAdapter.Awardit).subscribe((payment) => {
      expect(payment.state).toEqual('intent');
      expect(payment.adapterId).toEqual(VoucherAdapter.Awardit);
      done();
    });
  });

  it('getPayment should not emit if payment matching the adapter is not found', (done) => {
    dataServiceSpy.getOrder.and.returnValue(of(mockOrderFixture));
    let emitted = false;

    const subscription = service.getPayment('non-existent' as any).subscribe({
      next: () => {
        emitted = true;
      }
    });

    setTimeout(() => {
      expect(emitted).toBeFalse();
      subscription.unsubscribe();
      done();
    }, 10);
  });
});
