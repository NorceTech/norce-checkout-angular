import {
  ComponentRef,
  provideZonelessChangeDetection,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentFactoryComponent } from './payment-factory.component';
import { ToastService } from '~/app/core/toast/toast.service';
import { ADAPTERS, IAdapters } from '~/app/core/adapter';
import { WalleyComponent } from '~/app/features/payments/walley/walley.component';

// --- Fake ViewContainerRef ---
class FakeViewContainerRef implements Partial<ViewContainerRef> {
  clear = vi.fn();
  createComponent = vi.fn().mockImplementation((component: any) => {
    return { instance: {} } as ComponentRef<any>;
  });
}

describe('PaymentFactoryComponent', () => {
  let component: PaymentFactoryComponent;
  let componentRef: ComponentRef<PaymentFactoryComponent>;
  let fixture: ComponentFixture<PaymentFactoryComponent>;
  let fakeContainer: FakeViewContainerRef;
  let toastServiceSpy: Partial<ToastService>;
  let adaptersSpy: Partial<IAdapters>;

  const defaultTestAdapters = {
    shipping: { Ingrid: 'spy_ingrid_adapter' },
    voucher: { Awardit: 'spy_awardit_adapter' },
    payment: {
      Walley: 'spy_walley_adapter',
      Adyen: 'spy_adyen_adapter',
    },
  };

  beforeEach(async () => {
    toastServiceSpy = {
      error: vi.fn().mockName('ToastService.error'),
      show: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };
    adaptersSpy = {
      platform: { Norce: 'norce_adapter' },
      shipping: { Ingrid: 'ingrid_adapter' },
      voucher: { Awardit: 'awardit_adapter' },
      payment: {
        Walley: 'walley_checkout_adapter',
        Adyen: 'adyen_dropin_adapter',
        Kustom: 'klarna_checkout_adapter',
        Qliro: 'qliro_checkout_adapter',
      },
    } as Partial<IAdapters>;

    await TestBed.configureTestingModule({
      imports: [PaymentFactoryComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ADAPTERS, useValue: adaptersSpy },
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
  };

  it('should load the correct payment component for a valid adapter', () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    });
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Act
    (component as any).loadComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(WalleyComponent);
  });

  it('should not load any component if adapterId is not provided', () => {
    // Arrange
    componentRef.setInput('adapterId', undefined);

    // Act
    (component as any).loadComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if an unknown adapter id is provided', () => {
    // Arrange
    componentRef.setInput('adapterId', 'Invalid');

    // Act
    (component as any).loadComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No payment component registered for adapter: Invalid',
    );
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    });
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);
    component.container = signal(undefined);

    // Act
    (component as any).loadComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load payment component into',
    );
  });

  it('should clear the container and destroy previous component if one exists', () => {
    // Arrange
    const fakeComponentRef = { destroy: vi.fn() };
    (component as any).componentRef = fakeComponentRef;
    component.container = signal(fakeContainer as unknown as ViewContainerRef);

    // Act
    (component as any).clearContainer();

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeComponentRef.destroy).toHaveBeenCalled();
    expect((component as any).componentRef).toBeUndefined();
  });

  it('should call loadComponent after render (via afterRenderEffect)', async () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    });
    const loadComponentSpy = vi.spyOn(component, 'loadComponent' as any);
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Trigger change detection and wait for stability
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loadComponentSpy).toHaveBeenCalledWith(
      defaultTestAdapters.payment.Walley,
    );
  });
});
