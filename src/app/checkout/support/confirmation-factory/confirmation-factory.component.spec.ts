import {ComponentRef, provideExperimentalZonelessChangeDetection, ViewContainerRef,} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConfirmationFactoryComponent} from './confirmation-factory.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {PaymentAdapter} from '~/app/core/adapter';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';
import {
  FallbackConfirmationComponent
} from '~/app/checkout/support/fallback-confirmation/fallback-confirmation.component';

// --- Fake ViewContainerRef ---
class FakeViewContainerRef implements Partial<ViewContainerRef> {
  clear = jasmine.createSpy('clear');
  createComponent = jasmine
    .createSpy('createComponent')
    .and.callFake((component: any) => {
      return {instance: {}} as ComponentRef<any>;
    });
}

describe('ConfirmationFactoryComponent', () => {
  let component: ConfirmationFactoryComponent;
  let componentRef: ComponentRef<ConfirmationFactoryComponent>;
  let fixture: ComponentFixture<ConfirmationFactoryComponent>;
  let fakeContainer: FakeViewContainerRef;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error']);

    await TestBed.configureTestingModule({
      imports: [ConfirmationFactoryComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ToastService, useValue: toastServiceSpy},
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(ConfirmationFactoryComponent);
    await fixture.whenStable();
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide a fake container instance and assign it to the ViewChild.
    fakeContainer = new FakeViewContainerRef();
    component.container = fakeContainer as unknown as ViewContainerRef;

    // By default, set the adapterId input to undefined.
    componentRef.setInput('adapterId', undefined);
  });

  it('should load the correct confirmation component for a valid adapter (Walley)', () => {
    // Arrange: set adapterId to a known adapter from CONFIRMATION_COMPONENTS.
    componentRef.setInput('adapterId', PaymentAdapter.Walley);

    // Act: invoke the private loadPaymentComponent helper.
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: container should be cleared and createComponent called with WalleyComponent.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(WalleyComponent);
  });

  it('should load FallbackConfirmationComponent if adapterId is not registered', () => {
    // Arrange: use an invalid adapter id.
    componentRef.setInput('adapterId', 'Invalid');

    // Act:
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: container is cleared and FallbackConfirmationComponent is created.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(
      FallbackConfirmationComponent
    );
  });

  it('should do nothing if adapterId is not provided', () => {
    // Arrange: adapterId is left undefined.
    componentRef.setInput('adapterId', undefined);

    // Act:
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: container methods are not called and no error is thrown.
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    // Arrange: set a valid adapter id.
    componentRef.setInput('adapterId', PaymentAdapter.Walley);
    // Simulate missing container.
    component.container = undefined;

    // Act:
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert: the toast error is displayed.
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load confirmation component into'
    );
  });

  it('should clear the container and destroy previous component if one exists', () => {
    // Arrange: simulate an existing component reference.
    const fakeComponentRef = {destroy: jasmine.createSpy('destroy')};
    (component as any).componentRef = fakeComponentRef;
    component.container = fakeContainer as unknown as ViewContainerRef;

    // Act: call clearContainer.
    (component as any).clearContainer();

    // Assert: container is cleared, the fake component is destroyed, and componentRef is reset.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeComponentRef.destroy).toHaveBeenCalled();
    expect((component as any).componentRef).toBeUndefined();
  });

  it('should call loadPaymentComponent after render (via afterRenderEffect)', (done) => {
    // Arrange: spy on the private loadPaymentComponent.
    spyOn<any>(component, 'loadPaymentComponent');
    componentRef.setInput('adapterId', PaymentAdapter.Walley);

    // Since afterRenderEffect defers the call until after render, wait a tick.
    setTimeout(() => {
      expect((component as any).loadPaymentComponent).toHaveBeenCalledWith(
        PaymentAdapter.Walley
      );
      done();
    }, 0);
  });
});
