import {ComponentRef, provideExperimentalZonelessChangeDetection, signal, ViewContainerRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaymentFactoryComponent} from './payment-factory.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/features/payments/walley/walley.component';

// --- Fake ViewContainerRef ---
class FakeViewContainerRef implements Partial<ViewContainerRef> {
  clear = jasmine.createSpy('clear');
  createComponent = jasmine.createSpy('createComponent').and.callFake((component: any) => {
    return {instance: {}} as ComponentRef<any>;
  });
}

describe('PaymentFactoryComponent', () => {
  let component: PaymentFactoryComponent;
  let componentRef: ComponentRef<PaymentFactoryComponent>;
  let fixture: ComponentFixture<PaymentFactoryComponent>;
  let fakeContainer: FakeViewContainerRef;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let adaptersSpy: jasmine.SpyObj<IAdapters>;

  const defaultTestAdapters = {
    shipping: {Ingrid: 'spy_ingrid_adapter'},
    voucher: {Awardit: 'spy_awardit_adapter'},
    payment: {
      Walley: 'spy_walley_adapter',
      Adyen: 'spy_adyen_adapter'
    }
  };

  beforeEach(async () => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error']);
    adaptersSpy = jasmine.createSpyObj('IAdapters', [], defaultTestAdapters);

    await TestBed.configureTestingModule({
      imports: [
        PaymentFactoryComponent,
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ToastService, useValue: toastServiceSpy},
        {provide: ADAPTERS, useValue: adaptersSpy},
      ],
    }).compileComponents();

    // Create the component and componentRef.
    fixture = TestBed.createComponent(PaymentFactoryComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide a fake container instance and assign it to the ViewChild.
    fakeContainer = new FakeViewContainerRef();
    component.container = signal(fakeContainer as unknown as ViewContainerRef);

    // By default, set the adapterId input to undefined.
    componentRef.setInput('adapterId', undefined);
  });

  const setComponentRenderMap = (renderMap: Record<string, any>) => {
    component['PAYMENT_COMPONENTS'] = renderMap as any;
  }

  it('should load the correct payment component for a valid adapter', () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    })
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(WalleyComponent);
  });

  it('should not load any component if adapterId is not provided', () => {
    // Arrange
    componentRef.setInput('adapterId', undefined);

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if an unknown adapter id is provided', () => {
    // Arrange
    componentRef.setInput('adapterId', 'Invalid');

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No payment component registered for adapter: Invalid'
    );
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    })
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);
    component.container = signal(undefined);

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load payment component into'
    );
  });

  it('should clear the container and destroy previous component if one exists', () => {
    // Arrange
    const fakeComponentRef = {destroy: jasmine.createSpy('destroy')};
    (component as any).componentRef = fakeComponentRef;
    component.container = signal(fakeContainer as unknown as ViewContainerRef);

    // Act
    (component as any).clearContainer();

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeComponentRef.destroy).toHaveBeenCalled();
    expect((component as any).componentRef).toBeUndefined();
  });

  it('should call loadPaymentComponent after render (via afterRenderEffect)', (done) => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    })
    spyOn<any>(component, 'loadPaymentComponent');
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Assert
    setTimeout(() => {
      expect((component as any).loadPaymentComponent).toHaveBeenCalledWith(defaultTestAdapters.payment.Walley);
      done();
    }, 0);
  });
});
