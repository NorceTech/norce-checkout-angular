import {ComponentRef, provideExperimentalZonelessChangeDetection, ViewContainerRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaymentFactoryComponent} from './payment-factory.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {PaymentAdapter} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';

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

  beforeEach(async () => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error']);

    await TestBed.configureTestingModule({
      imports: [
        PaymentFactoryComponent,
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ToastService, useValue: toastServiceSpy}
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(PaymentFactoryComponent);
    await fixture.whenStable();
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide a fake container instance and assign it to the ViewChild.
    fakeContainer = new FakeViewContainerRef();
    component.container = fakeContainer as unknown as ViewContainerRef;

    // By default, set adapterId to return undefined.
    componentRef.setInput('adapterId', undefined);
  });

  it('should load the correct payment component for a valid adapter (Walley)', () => {
    // Arrange: set adapterId to return a valid adapter.
    componentRef.setInput('adapterId', PaymentAdapter.Walley);

    // Act: invoke the private loadPaymentComponent helper.
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: container should be cleared, and createComponent is called with FakeWalleyComponent.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(WalleyComponent);
  });

  it('should not load any component if adapterId is not provided', () => {
    // Arrange: adapterId returns undefined.
    componentRef.setInput('adapterId', undefined);

    // Act:
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: nothing should happen – container methods are not called and no error is shown.
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if an unknown adapter id is provided', () => {
    // Arrange: use an unknown adapter id.
    componentRef.setInput('adapterId', 'Invalid');

    // Act:
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: toastService.error is called with the proper message.
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No payment component registered for adapter: Invalid'
    );
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    // Arrange: set a valid adapter id.
    componentRef.setInput('adapterId', PaymentAdapter.Adyen);
    component.container = undefined;

    // Act:
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert:
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load payment component into'
    );
  });

  it('should clear the container and destroy previous component if one exists', () => {
    // Arrange: simulate an existing componentRef.
    const fakeComponentRef = {destroy: jasmine.createSpy('destroy')};
    (component as any).componentRef = fakeComponentRef;
    // Also assign the fake container.
    component.container = fakeContainer as unknown as ViewContainerRef;

    // Act: call clearContainer.
    (component as any).clearContainer();

    // Assert: container is cleared and the componentRef is destroyed.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeComponentRef.destroy).toHaveBeenCalled();
    expect((component as any).componentRef).toBeUndefined();
  });

  it('should call loadPaymentComponent after render (via afterRenderEffect)', (done) => {
    // Arrange: spy on the private loadPaymentComponent.
    spyOn<any>(component, 'loadPaymentComponent');
    componentRef.setInput('adapterId', PaymentAdapter.Adyen);

    fixture.detectChanges();

    // Since afterRenderEffect defers the call until after render,
    // we wait a tick.
    setTimeout(() => {
      expect((component as any).loadPaymentComponent).toHaveBeenCalledWith(PaymentAdapter.Adyen);
      done();
    }, 0);
  });
});
