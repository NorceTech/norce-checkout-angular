import {ComponentRef, provideExperimentalZonelessChangeDetection, ViewContainerRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ShippingFactoryComponent} from './shipping-factory.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {PaymentAdapter, ShippingAdapter} from '~/app/core/adapter';
import {IngridComponent} from '~/app/checkout/shippings/ingrid/ingrid.component';

// --- Fake ViewContainerRef ---
class FakeViewContainerRef implements Partial<ViewContainerRef> {
  clear = jasmine.createSpy('clear');
  createComponent = jasmine.createSpy('createComponent').and.callFake((component: any) => {
    return {instance: {}} as ComponentRef<any>;
  });
}

describe('ShippingFactoryComponent', () => {
  let component: ShippingFactoryComponent;
  let componentRef: ComponentRef<ShippingFactoryComponent>;
  let fixture: ComponentFixture<ShippingFactoryComponent>;
  let fakeContainer: FakeViewContainerRef;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error']);

    await TestBed.configureTestingModule({
      imports: [
        ShippingFactoryComponent,
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ToastService, useValue: toastServiceSpy},
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(ShippingFactoryComponent);
    await fixture.whenStable();
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide a fake container instance and assign it to the ViewChild.
    fakeContainer = new FakeViewContainerRef();
    component.container = fakeContainer as unknown as ViewContainerRef;

    // By default, set adapterId to return undefined.
    componentRef.setInput('adapterId', undefined);
  });

  it('should load the correct shipping component for a valid adapter (Ingrid)', () => {
    // Arrange: set adapterId to return a valid shipping adapter.
    componentRef.setInput('adapterId', ShippingAdapter.Ingrid);

    // Act: invoke the private loadShippingComponent helper.
    (component as any).loadShippingComponent(component.adapterId());

    // Assert: container should be cleared and createComponent called.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(IngridComponent);
  });

  it('should not load any component if adapterId is not provided', () => {
    // Arrange: adapterId returns undefined.
    componentRef.setInput('adapterId', undefined);

    // Act:
    (component as any).loadShippingComponent(component.adapterId());

    // Assert: nothing should happen – container methods not called, no error.
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should not load any shipping component if adapterId is part of PaymentAdapters', () => {
    // Arrange: set adapterId to a value that is in PaymentAdapters.
    componentRef.setInput('adapterId', PaymentAdapter.Walley);

    // Act:
    (component as any).loadShippingComponent(component.adapterId());

    // Assert: since the adapter comes from payments, nothing is rendered.
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if an unknown shipping adapter id is provided', () => {
    // Arrange: use an invalid shipping adapter id.
    componentRef.setInput('adapterId', 'Invalid');

    // Act:
    (component as any).loadShippingComponent(component.adapterId());

    // Assert: toastService.error is called with the proper message.
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No shipping component registered for adapter Invalid'
    );
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    componentRef.setInput('adapterId', ShippingAdapter.Ingrid);
    // Simulate missing container.
    component.container = undefined;

    // Act:
    (component as any).loadShippingComponent(component.adapterId());

    // Assert:
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load shipping component into'
    );
  });

  it('should clear the container and destroy previous component if one exists', () => {
    // Arrange: simulate an existing componentRef.
    const fakeComponentRef = {destroy: jasmine.createSpy('destroy')};
    (component as any).componentRef = fakeComponentRef;
    component.container = fakeContainer as unknown as ViewContainerRef;

    // Act: call clearContainer.
    (component as any).clearContainer();

    // Assert: container is cleared, previous component destroyed, and componentRef reset.
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeComponentRef.destroy).toHaveBeenCalled();
    expect((component as any).componentRef).toBeUndefined();
  });

  it('should call loadShippingComponent after render (via afterRenderEffect)', (done) => {
    // Arrange: spy on the private loadShippingComponent.
    spyOn<any>(component, 'loadShippingComponent');
    componentRef.setInput('adapterId', ShippingAdapter.Ingrid);

    setTimeout(() => {
      expect((component as any).loadShippingComponent).toHaveBeenCalledWith(
        ShippingAdapter.Ingrid
      );
      done();
    }, 0);
  });
});
