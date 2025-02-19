import {Component, input, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {CheckoutComponent} from './checkout.component';
import {OrderService} from '~/app/core/order/order.service';
import {OrderStatus} from '~/openapi/order';
import {CartComponent} from '~/app/features/cart/cart.component';
import {SummaryComponent} from '~/app/features/summary/summary.component';
import {PaymentFactoryComponent} from '~/app/features/payments/payment-factory/payment-factory.component';
import {ShippingFactoryComponent} from '~/app/features/shippings/shipping-factory/shipping-factory.component';
import {PaymentSelectorComponent} from '~/app/features/payments/payment-selector/payment-selector.component';
import {ShippingSelectorComponent} from '~/app/features/shippings/shipping-selector/shipping-selector.component';
import {By} from '@angular/platform-browser';

// Mock child components
@Component({selector: 'app-cart', template: ''})
class MockCartComponent {
}

@Component({selector: 'app-summary', template: ''})
class MockSummaryComponent {
}

@Component({selector: 'app-shipping-selector', template: ''})
class MockShippingSelectorComponent {
}

@Component({selector: 'app-shipping-factory', template: ''})
class MockShippingFactoryComponent {
  adapterId = input<string>();
}

@Component({selector: 'app-payment-selector', template: ''})
class MockPaymentSelectorComponent {
}

@Component({selector: 'app-payment-factory', template: ''})
class MockPaymentFactoryComponent {
  adapterId = input<string>();
}


// Mock services
class MockOrderService {
  order$ = new Subject<any>();
  defaultPayment$ = new BehaviorSubject<any>({});
  nonRemovedShippings$ = new BehaviorSubject<any[]>([]);
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let orderService: MockOrderService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: OrderService, useClass: MockOrderService},
        {provide: Router, useClass: MockRouter},
      ]
    })
      .overrideComponent(CheckoutComponent, {
        remove: {
          imports: [
            CartComponent,
            SummaryComponent,
            PaymentFactoryComponent,
            ShippingFactoryComponent,
            PaymentSelectorComponent,
            ShippingSelectorComponent
          ]
        },
        add: {
          imports: [
            MockCartComponent,
            MockSummaryComponent,
            MockPaymentFactoryComponent,
            MockShippingFactoryComponent,
            MockPaymentSelectorComponent,
            MockShippingSelectorComponent
          ]
        }
      })
      .compileComponents();

    orderService = TestBed.inject(OrderService) as unknown as MockOrderService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to confirmation when order status is completed', () => {
    const testStatuses: OrderStatus[] = ['accepted', 'completed', 'declined', 'removed'];

    testStatuses.forEach(status => {
      (orderService.order$ as Subject<any>).next({state: {currentStatus: status}});
      expect(router.navigate).toHaveBeenCalledOnceWith(
        ['/confirmation'],
        {queryParamsHandling: 'preserve'}
      );
      router.navigate.calls.reset();
    });
  });

  it('should not navigate for non-completed statuses', () => {
    const testStatuses: OrderStatus[] = ['checkout', 'processing'];

    testStatuses.forEach(status => {
      (orderService.order$ as Subject<any>).next({state: {currentStatus: status}});
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  it('should emit default payment adapter ID', (done) => {
    const testAdapterId = 'pay_123';
    component.defaultPaymentAdapterId$.subscribe(adapterId => {
      expect(adapterId).toBe(testAdapterId);
      done();
    });

    orderService.defaultPayment$.next({adapterId: testAdapterId});
  });

  it('should emit first shipping adapter ID', (done) => {
    const testShippings = [
      {adapterId: 'ship_1'},
      {adapterId: 'ship_2'}
    ];

    component.firstShippingAdapterId$.subscribe(adapterId => {
      expect(adapterId).toBe('ship_1');
      done();
    });

    orderService.nonRemovedShippings$.next(testShippings);
  });

  it('should only emit distinct adapter ids', (done) => {
    const paymentEmissions: string[] = [];
    const shippingEmissions: string[] = [];

    component.defaultPaymentAdapterId$.subscribe({
      next: v => paymentEmissions.push(v as string),
      complete: done
    });
    component.firstShippingAdapterId$.subscribe({
      next: v => shippingEmissions.push(v as string),
      complete: done
    });

    orderService.defaultPayment$.next({adapterId: 'pay_123'});
    orderService.defaultPayment$.next({adapterId: 'pay_123'}); // Duplicate
    orderService.defaultPayment$.next({adapterId: 'pay_654'});
    orderService.nonRemovedShippings$.next([{adapterId: 'ship_1'}]);
    orderService.nonRemovedShippings$.next([{adapterId: 'ship_1'}]); // Duplicate
    orderService.nonRemovedShippings$.next([{adapterId: 'ship_2'}]);

    setTimeout(() => {
      expect(paymentEmissions).toEqual(['pay_123', 'pay_654']);
      expect(shippingEmissions).toEqual(['ship_1', 'ship_2']);
      done();
    }, 0);
  });

  it('should unsubscribe on destroy', () => {
    const order$ = orderService.order$ as Subject<any>;
    fixture.destroy();
    order$.next({state: {currentStatus: 'accepted'}});
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should pass adapterIds to factories if they exist', async () => {
    const paymentAdapterId = 'pay_123';
    const shippingAdapterId = 'ship_456';
    orderService.defaultPayment$.next({adapterId: paymentAdapterId});
    orderService.nonRemovedShippings$.next([{adapterId: shippingAdapterId}]);
    await fixture.whenStable();

    const paymentFactory = fixture.debugElement.query(
      By.directive(MockPaymentFactoryComponent)
    ).componentInstance as MockPaymentFactoryComponent;

    const shippingFactory = fixture.debugElement.query(
      By.directive(MockShippingFactoryComponent)
    ).componentInstance as MockShippingFactoryComponent;

    expect(paymentFactory.adapterId()).toBe(paymentAdapterId);
    expect(shippingFactory.adapterId()).toBe(shippingAdapterId);
  });

  it('should render all required components when payment and shipping exist', async () => {
    const paymentAdapterId = 'pay_123';
    const shippingAdapterId = 'ship_456';
    orderService.defaultPayment$.next({adapterId: paymentAdapterId});
    orderService.nonRemovedShippings$.next([{adapterId: shippingAdapterId}]);
    await fixture.whenStable();

    const components = [
      MockCartComponent,
      MockSummaryComponent,
      MockPaymentFactoryComponent,
      MockShippingFactoryComponent,
      MockPaymentSelectorComponent,
      MockShippingSelectorComponent
    ];

    components.forEach(componentType => {
      expect(fixture.debugElement.query(By.directive(componentType))).toBeTruthy();
    });
  });

  it('should not render factories if not created yet', () => {
    const componentExist = [
      MockCartComponent,
      MockSummaryComponent,
      MockPaymentSelectorComponent,
      MockShippingSelectorComponent
    ];
    const componentNotExist = [
      MockPaymentFactoryComponent,
      MockShippingFactoryComponent,
    ];

    componentExist.forEach(componentType => {
      expect(fixture.debugElement.query(By.directive(componentType))).toBeTruthy();
    });
    componentNotExist.forEach(componentType => {
      expect(fixture.debugElement.query(By.directive(componentType))).toBeFalsy();
    });
  });
});
