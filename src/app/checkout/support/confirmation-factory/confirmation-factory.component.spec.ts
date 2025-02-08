import {ComponentRef, provideExperimentalZonelessChangeDetection, ViewContainerRef,} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConfirmationFactoryComponent} from './confirmation-factory.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {WalleyComponent} from '~/app/checkout/payments/walley/walley.component';
import {
  FallbackConfirmationComponent
} from '~/app/checkout/support/fallback-confirmation/fallback-confirmation.component';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';

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
      imports: [ConfirmationFactoryComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ToastService, useValue: toastServiceSpy},
        {provide: ADAPTERS, useValue: adaptersSpy},
      ],
    }).compileComponents();

    // Create the component and componentRef.
    fixture = TestBed.createComponent(ConfirmationFactoryComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide a fake container instance and assign it to the ViewChild.
    fakeContainer = new FakeViewContainerRef();
    component.container = fakeContainer as unknown as ViewContainerRef;

    // By default, set the adapterId input to undefined.
    componentRef.setInput('adapterId', undefined);
  });

  it('should load the correct confirmation component for a valid adapter', () => {
    // Assert
    component['CONFIRMATION_COMPONENTS'] = {
      [defaultTestAdapters.payment.Walley]: WalleyComponent,
    } as any;
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(WalleyComponent);
  });

  it('should load FallbackConfirmationComponent if adapterId is not registered', () => {
    // Arrange
    componentRef.setInput('adapterId', 'Invalid');

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(
      FallbackConfirmationComponent
    );
  });

  it('should do nothing if adapterId is not provided', () => {
    // Arrange
    componentRef.setInput('adapterId', undefined);

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    // Arrange
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);
    component.container = undefined;

    // Act
    (component as any).loadPaymentComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load confirmation component into'
    );
  });

  it('should clear the container and destroy previous component if one exists', () => {
    // Arrange
    const fakeComponentRef = {destroy: jasmine.createSpy('destroy')};
    (component as any).componentRef = fakeComponentRef;
    component.container = fakeContainer as unknown as ViewContainerRef;

    // Act
    (component as any).clearContainer();

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeComponentRef.destroy).toHaveBeenCalled();
    expect((component as any).componentRef).toBeUndefined();
  });

  it('should call loadPaymentComponent after render (via afterRenderEffect)', (done) => {
    // Arrange
    spyOn<any>(component, 'loadPaymentComponent');
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Assert
    setTimeout(() => {
      expect((component as any).loadPaymentComponent).toHaveBeenCalledWith(
        defaultTestAdapters.payment.Walley
      );
      done();
    }, 0);
  });
});
