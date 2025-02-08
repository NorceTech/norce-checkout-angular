import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject, of} from 'rxjs';
import {PaymentSelectorComponent} from './payment-selector.component';
import {ConfigService} from '~/app/core/config/config.service';
import {OrderService} from '~/app/core/order/order.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {PAYMENT_SERVICES} from '~/app/checkout/payments/provide-payment-services';
import {IPaymentService} from '~/app/checkout/payments/payment.service.interface';
import {provideExperimentalZonelessChangeDetection} from '@angular/core';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';

describe('PaymentSelectorComponent', () => {
  let fixture: ComponentFixture<PaymentSelectorComponent>;
  let component: PaymentSelectorComponent;

  // Create BehaviorSubjects so we can simulate updates.
  let configSubject: BehaviorSubject<any[]>;
  let orderSubject: BehaviorSubject<any>;
  let defaultPaymentSubject: BehaviorSubject<any>;
  let hasDefaultPaymentSubject: BehaviorSubject<boolean>;

  // Create spies for the injected services.
  let configServiceSpy: jasmine.SpyObj<ConfigService>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let syncServiceSpy: jasmine.SpyObj<SyncService>;
  let paymentServiceOneSpy: jasmine.SpyObj<IPaymentService>;
  let paymentServiceTwoSpy: jasmine.SpyObj<IPaymentService>;
  let fakePaymentServices: IPaymentService[];
  let adaptersSpy: jasmine.SpyObj<IAdapters>;

  const defaultTestAdapters = {
    shipping: {Ingrid: 'spy_ingrid_adapter'},
    voucher: {Awardit: 'spy_awardit_adapter'},
    payment: {
      Walley: 'spy_walley_adapter',
      Adyen: 'spy_adyen_adapter'
    }
  };

  beforeEach(() => {
    // Initialize our BehaviorSubjects with default values.
    configSubject = new BehaviorSubject<any[]>([]);
    orderSubject = new BehaviorSubject({id: 'orderId'});
    defaultPaymentSubject = new BehaviorSubject(undefined);
    hasDefaultPaymentSubject = new BehaviorSubject(false);

    configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      configs$: configSubject.asObservable(),
    });
    orderServiceSpy = jasmine.createSpyObj('OrderService', [], {
      order$: orderSubject.asObservable(),
      defaultPayment$: defaultPaymentSubject.asObservable(),
      hasDefaultPayment$: hasDefaultPaymentSubject.asObservable(),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warn', 'error']);
    syncServiceSpy = jasmine.createSpyObj('SyncService', ['triggerRefresh']);
    paymentServiceOneSpy = jasmine.createSpyObj('paymentService', ['createPayment', 'removePayment'], {
      adapterId: defaultTestAdapters.payment.Walley
    });
    paymentServiceTwoSpy = jasmine.createSpyObj('paymentService', ['createPayment', 'removePayment'], {
      adapterId: defaultTestAdapters.payment.Adyen
    });
    fakePaymentServices = [paymentServiceOneSpy, paymentServiceTwoSpy];
    adaptersSpy = jasmine.createSpyObj('IAdapters', ['payments'], defaultTestAdapters);

    TestBed.configureTestingModule({
      imports: [PaymentSelectorComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ConfigService, useValue: configServiceSpy},
        {provide: OrderService, useValue: orderServiceSpy},
        {provide: ToastService, useValue: toastServiceSpy},
        {provide: SyncService, useValue: syncServiceSpy},
        {provide: PAYMENT_SERVICES, useValue: fakePaymentServices},
        {provide: ADAPTERS, useValue: adaptersSpy},
      ],
    }).compileComponents();
  });

  afterEach(() => {
    // Reset the spies after each test.
    paymentServiceOneSpy.createPayment.calls.reset();
    paymentServiceOneSpy.removePayment.calls.reset();
    paymentServiceTwoSpy.createPayment.calls.reset();
    paymentServiceTwoSpy.removePayment.calls.reset();
    syncServiceSpy.triggerRefresh.calls.reset();
    toastServiceSpy.warn.calls.reset();
    toastServiceSpy.error.calls.reset();
  })

  it('should compute enabledPaymentAdapters$ correctly', (done) => {
    configSubject.next([{id: defaultTestAdapters.payment.Walley, active: true}]);
    hasDefaultPaymentSubject.next(true);

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;

    component.enabledPaymentAdapters$.subscribe((adapters) => {
      expect(adapters).toEqual([defaultTestAdapters.payment.Walley]);
      done();
    });
  });

  it('should warn if a config is active and of a payment type but no payment service is available', (done) => {
    configSubject.next([{id: defaultTestAdapters.payment.Adyen, active: true}]);
    TestBed.overrideProvider(PAYMENT_SERVICES, {useValue: []});

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;

    component.enabledPaymentAdapters$.subscribe((adapters) => {
      expect(toastServiceSpy.warn).toHaveBeenCalledOnceWith(
        `Payment service for ${defaultTestAdapters.payment.Adyen} is not available`
      );
      expect(adapters).toEqual([]);
      done();
    });
  });

  it('should compute selectedPaymentAdapter$ correctly', (done) => {
    defaultPaymentSubject.next({id: 'payment1', adapterId: defaultTestAdapters.payment.Walley});

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;

    component.selectedPaymentAdapter$.subscribe((adapter) => {
      expect(adapter).toBe(defaultTestAdapters.payment.Walley);
      done();
    });
  });

  describe('constructor side-effect', () => {
    it('should create a default payment if no default payment exists', () => {
      hasDefaultPaymentSubject.next(false);
      defaultPaymentSubject.next(undefined);
      configSubject.next([{id: defaultTestAdapters.payment.Walley, active: true}]);
      paymentServiceOneSpy.createPayment.and.returnValue(of({id: 'payment1'}));

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance;

      expect(paymentServiceOneSpy.createPayment).toHaveBeenCalledWith('orderId');
      expect(syncServiceSpy.triggerRefresh).toHaveBeenCalled();
    });

    it('should not create a default payment if no default payment exists with no configs', () => {
      hasDefaultPaymentSubject.next(false);
      defaultPaymentSubject.next(undefined);
      configSubject.next([]);

      // Reset the createPayment spy.
      fixture = TestBed.createComponent(PaymentSelectorComponent);

      expect(paymentServiceOneSpy.createPayment).not.toHaveBeenCalled();
      expect(syncServiceSpy.triggerRefresh).toHaveBeenCalledTimes(1);
    });

    it('should not create a default payment if a default payment exists', () => {
      hasDefaultPaymentSubject.next(true);
      defaultPaymentSubject.next({id: 'payment0', adapterId: defaultTestAdapters.payment.Walley});
      configSubject.next([{id: defaultTestAdapters.payment.Walley, active: true}]);

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance;

      expect(paymentServiceOneSpy.createPayment).not.toHaveBeenCalled();
    });
  });

  describe('createOrReplacePaymentByAdapterId', () => {
    it('should directly create a payment if no default payment exists', () => {
      hasDefaultPaymentSubject.next(false);
      defaultPaymentSubject.next(undefined);
      configSubject.next([{id: defaultTestAdapters.payment.Walley, active: true}]);
      paymentServiceOneSpy.createPayment.and.returnValue(of({id: 'payment1'}));

      TestBed.overrideProvider(PAYMENT_SERVICES, {useValue: [paymentServiceOneSpy, paymentServiceTwoSpy]});
      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance;
      component.createOrReplacePaymentByAdapterId(defaultTestAdapters.payment.Walley);

      expect(paymentServiceOneSpy.createPayment).toHaveBeenCalledWith('orderId');
      expect(paymentServiceOneSpy.removePayment).not.toHaveBeenCalled();
      expect(syncServiceSpy.triggerRefresh).toHaveBeenCalled();
    });

    it('should remove then create a payment if a default payment exists', (done) => {
      hasDefaultPaymentSubject.next(true);
      defaultPaymentSubject.next({id: 'payment0', adapterId: defaultTestAdapters.payment.Walley, state: 'intent'});
      configSubject.next([
        {id: defaultTestAdapters.payment.Adyen, active: true},
        {id: defaultTestAdapters.payment.Walley, active: true},
      ]);

      TestBed.overrideProvider(PAYMENT_SERVICES, {useValue: fakePaymentServices});

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance

      const removePaymentUsingServiceSpy = spyOn(component, 'removePaymentUsingService' as any);
      const createPaymentUsingServiceSpy = spyOn(component, 'createPaymentUsingService' as any);
      removePaymentUsingServiceSpy.and.returnValue(of({}));
      createPaymentUsingServiceSpy.and.returnValue(of({id: 'payment1'}));

      component.createOrReplacePaymentByAdapterId(defaultTestAdapters.payment.Adyen)

      setTimeout(() => {
        expect(removePaymentUsingServiceSpy).toHaveBeenCalledWith(paymentServiceOneSpy);
        expect(createPaymentUsingServiceSpy).toHaveBeenCalledWith(paymentServiceTwoSpy);
        expect(syncServiceSpy.triggerRefresh).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
});
