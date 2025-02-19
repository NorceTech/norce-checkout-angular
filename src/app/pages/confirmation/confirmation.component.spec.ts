import {Component, input, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {ConfirmationComponent} from './confirmation.component';
import {OrderService} from '~/app/core/order/order.service';
import {ConfirmationFactoryComponent} from '~/app/features/confirmation/confirmation-factory/confirmation-factory.component';
import {OrderStatus} from '~/openapi/order';

// Mock child component
@Component({selector: 'app-confirmation-factory', template: ''})
class MockConfirmationFactoryComponent {
  adapterId = input<string>();
}

// Mock services
class MockOrderService {
  order$ = new Subject<any>();
  defaultPayment$ = new BehaviorSubject<any>({});
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('ConfirmationComponent', () => {
  let component: ConfirmationComponent;
  let fixture: ComponentFixture<ConfirmationComponent>;
  let orderService: MockOrderService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: OrderService, useClass: MockOrderService},
        {provide: Router, useClass: MockRouter},
      ]
    })
      .overrideComponent(ConfirmationComponent, {
        remove: {imports: [ConfirmationFactoryComponent]},
        add: {imports: [MockConfirmationFactoryComponent]}
      })
      .compileComponents();

    orderService = TestBed.inject(OrderService) as unknown as MockOrderService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to checkout when order status is in checkout states', () => {
    const testStatuses = ['checkout', 'processing'];

    testStatuses.forEach(status => {
      (orderService.order$ as Subject<any>).next({state: {currentStatus: status}});
      expect(router.navigate).toHaveBeenCalledWith(
        ['/checkout'],
        {queryParamsHandling: 'preserve'}
      );
      router.navigate.calls.reset();
    });
  });

  it('should not navigate for non-checkout statuses', () => {
    const testStatuses: OrderStatus[] = ['accepted', 'completed', 'declined', 'removed'];

    testStatuses.forEach(status => {
      (orderService.order$ as Subject<any>).next({state: {currentStatus: status}});
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  it('should emit default payment adapter ID', (done) => {
    const testAdapterId = 'pay_789';
    component.defaultPaymentAdapterId$.subscribe(adapterId => {
      expect(adapterId).toBe(testAdapterId);
      done();
    });

    orderService.defaultPayment$.next({adapterId: testAdapterId});
  });

  it('should unsubscribe on destroy', () => {
    const order$ = orderService.order$ as Subject<any>;
    fixture.destroy();
    order$.next({state: {currentStatus: 'checkout'}});
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should pass adapter ID to ConfirmationFactoryComponent', async () => {
    const testAdapterId = 'pay_456';

    orderService.defaultPayment$.next({adapterId: testAdapterId});
    await fixture.whenStable();

    const factoryComponent = fixture.debugElement.query(
      By.directive(MockConfirmationFactoryComponent)
    ).componentInstance as MockConfirmationFactoryComponent;

    expect(factoryComponent.adapterId()).toBe(testAdapterId);
  });

  it('should only emit distinct payment adapter ids', (done) => {
    const emissions: string[] = [];

    component.defaultPaymentAdapterId$.subscribe({
      next: v => emissions.push(v as string),
      complete: done
    });

    orderService.defaultPayment$.next({adapterId: 'pay_123'});
    orderService.defaultPayment$.next({adapterId: 'pay_123'}); // Duplicate
    orderService.defaultPayment$.next({adapterId: 'pay_456'});

    setTimeout(() => {
      expect(emissions).toEqual(['pay_123', 'pay_456']);
      done();
    }, 0);
  });

  it('should render confirmation factory component when payment exists', async () => {
    orderService.defaultPayment$.next({adapterId: 'pay_123'});
    await fixture.whenStable();

    expect(fixture.debugElement.query(
      By.directive(MockConfirmationFactoryComponent)
    )).toBeTruthy();
  });

  it('should not render confirmation factory component when payment does not exist', async () => {
    await fixture.whenStable();
    expect(fixture.debugElement.query(
      By.directive(MockConfirmationFactoryComponent)
    )).toBeFalsy();
  });
});
