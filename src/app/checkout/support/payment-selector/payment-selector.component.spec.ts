import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject, of} from 'rxjs';
import {PaymentSelectorComponent} from './payment-selector.component';
import {ConfigService} from '~/app/core/config/config.service';
import {OrderService} from '~/app/core/order/order.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {PAYMENT_SERVICES} from '~/app/checkout/payments/provide-payment-services';
import {IPaymentService} from '~/app/checkout/payments/payment.service.interface';
import {PaymentAdapter} from '~/app/core/adapter';
import {provideExperimentalZonelessChangeDetection} from '@angular/core';

describe('PaymentSelectorComponent', () => {
  let fixture: ComponentFixture<PaymentSelectorComponent>;
  let component: PaymentSelectorComponent;

  // Create BehaviorSubjects so we can simulate updates.
  let configSubject: BehaviorSubject<any[]>;
  let orderSubject: BehaviorSubject<any>;
  let defaultPaymentSubject: BehaviorSubject<any>;
  let hasDefaultPaymentSubject: BehaviorSubject<boolean>;

  // Create spies for the injected services.
  let fakeConfigService: any;
  let fakeOrderService: any;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let fakeSyncService: jasmine.SpyObj<SyncService>;

  // Fake payment service implementing IPaymentService.
  let fakeWalleyPaymentService: jasmine.SpyObj<IPaymentService>;
  let fakeNotWalleyPaymentService: jasmine.SpyObj<IPaymentService>;
  let fakePaymentServices: IPaymentService[];

  beforeEach(() => {
    // Initialize our BehaviorSubjects with default values.
    configSubject = new BehaviorSubject<any[]>([]);
    orderSubject = new BehaviorSubject({id: 'orderId'});
    defaultPaymentSubject = new BehaviorSubject(undefined);
    hasDefaultPaymentSubject = new BehaviorSubject(false);

    // Create main spy objects, providing the BehaviorSubjects as property getters.
    fakeConfigService = jasmine.createSpyObj('ConfigService', [], {
      configs$: configSubject.asObservable(),
    });

    fakeOrderService = jasmine.createSpyObj('OrderService', [], {
      order$: orderSubject.asObservable(),
      defaultPayment$: defaultPaymentSubject.asObservable(),
      hasDefaultPayment$: hasDefaultPaymentSubject.asObservable(),
    });

    // Create a fake payment service for adapter 'Walley'.
    fakeWalleyPaymentService = {
      adapterId: PaymentAdapter.Walley,
      createPayment: jasmine
        .createSpy('createPayment')
        .and.returnValue(of({id: 'payment1'})),
      removePayment: jasmine
        .createSpy('removePayment')
        .and.returnValue(of({})),
    };
    fakeNotWalleyPaymentService = {
      adapterId: 'notWalley' as any,
      createPayment: jasmine
        .createSpy('createPayment')
        .and.returnValue(of({id: 'payment2'})),
      removePayment: jasmine
        .createSpy('removePayment')
        .and.returnValue(of({})),
    };
    fakePaymentServices = [fakeWalleyPaymentService, fakeNotWalleyPaymentService];

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warn', 'error']);
    fakeSyncService = jasmine.createSpyObj('SyncService', ['triggerRefresh']);

    TestBed.configureTestingModule({
      imports: [PaymentSelectorComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ConfigService, useValue: fakeConfigService},
        {provide: OrderService, useValue: fakeOrderService},
        {provide: ToastService, useValue: toastServiceSpy},
        {provide: SyncService, useValue: fakeSyncService},
        {provide: PAYMENT_SERVICES, useValue: fakePaymentServices},
      ],
    }).compileComponents();
  });

  afterEach(() => {
    // Reset the spies after each test.
    fakeWalleyPaymentService.createPayment.calls.reset();
    fakeWalleyPaymentService.removePayment.calls.reset();
    fakeNotWalleyPaymentService.createPayment.calls.reset();
    fakeNotWalleyPaymentService.removePayment.calls.reset();
    fakeSyncService.triggerRefresh.calls.reset();
    toastServiceSpy.warn.calls.reset();
    toastServiceSpy.error.calls.reset();
  })

  it('should compute enabledPaymentAdapters$ correctly', (done) => {
    configSubject.next([{id: PaymentAdapter.Walley, active: true}]);

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;

    component.enabledPaymentAdapters$.subscribe((adapters) => {
      expect(adapters).toEqual([PaymentAdapter.Walley]);
      done();
    });
  });

  it('should warn if a config is active and of a payment type but no payment service is available', (done) => {
    configSubject.next([{id: PaymentAdapter.Adyen, active: true}]);

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;

    component.enabledPaymentAdapters$.subscribe((adapters) => {
      expect(toastServiceSpy.warn).toHaveBeenCalledOnceWith(
        `Payment service for ${PaymentAdapter.Adyen} is not available`
      );
      expect(adapters).toEqual([]);
      done();
    });
  });

  it('should compute selectedPaymentAdapter$ correctly', (done) => {
    defaultPaymentSubject.next({id: 'payment1', adapterId: 'Walley'});

    fixture = TestBed.createComponent(PaymentSelectorComponent);
    component = fixture.componentInstance;

    component.selectedPaymentAdapter$.subscribe((adapter) => {
      expect(adapter).toBe('Walley');
      done();
    });
  });

  describe('constructor side-effect', () => {
    it('should create a default payment if no default payment exists', () => {
      hasDefaultPaymentSubject.next(false);
      defaultPaymentSubject.next(undefined);
      configSubject.next([{id: PaymentAdapter.Walley, active: true}]);

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance;

      expect(fakeWalleyPaymentService.createPayment).toHaveBeenCalledWith('orderId');
      expect(fakeSyncService.triggerRefresh).toHaveBeenCalled();
    });

    it('should not create a default payment if no default payment exists with no configs', () => {
      hasDefaultPaymentSubject.next(false);
      defaultPaymentSubject.next(undefined);
      configSubject.next([]);

      // Reset the createPayment spy.
      fixture = TestBed.createComponent(PaymentSelectorComponent);

      expect(fakeWalleyPaymentService.createPayment).not.toHaveBeenCalled();
      expect(fakeSyncService.triggerRefresh).toHaveBeenCalledTimes(1);
    });

    it('should not create a default payment if a default payment exists', () => {
      hasDefaultPaymentSubject.next(true);
      defaultPaymentSubject.next({id: 'payment0', adapterId: PaymentAdapter.Walley});
      configSubject.next([{id: PaymentAdapter.Walley, active: true}]);

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance;

      expect(fakeWalleyPaymentService.createPayment).not.toHaveBeenCalled();
    });
  });

  describe('createOrReplacePaymentByAdapterId', () => {
    it('should directly create a payment if no default payment exists', () => {
      hasDefaultPaymentSubject.next(false);
      defaultPaymentSubject.next(undefined);
      configSubject.next([{id: PaymentAdapter.Walley, active: true}]);

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance;
      component.createOrReplacePaymentByAdapterId(PaymentAdapter.Walley);

      expect(fakeWalleyPaymentService.createPayment).toHaveBeenCalledWith('orderId');
      expect(fakeWalleyPaymentService.removePayment).not.toHaveBeenCalled();
      expect(fakeSyncService.triggerRefresh).toHaveBeenCalled();
    });

    it('should remove then create a payment if a default payment exists', () => {
      hasDefaultPaymentSubject.next(true);
      defaultPaymentSubject.next({id: 'payment0', adapterId: 'notWalley'});

      fixture = TestBed.createComponent(PaymentSelectorComponent);
      component = fixture.componentInstance
      component.createOrReplacePaymentByAdapterId(PaymentAdapter.Walley);

      expect(fakeNotWalleyPaymentService.removePayment).toHaveBeenCalledWith('orderId', 'payment0');
      expect(fakeWalleyPaymentService.createPayment).toHaveBeenCalledWith('orderId');
      expect(fakeSyncService.triggerRefresh).toHaveBeenCalled();
    });
  });
});
