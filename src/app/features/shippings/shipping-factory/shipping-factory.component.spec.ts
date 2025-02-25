import {ComponentRef, provideExperimentalZonelessChangeDetection, signal, ViewContainerRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ShippingFactoryComponent} from './shipping-factory.component';
import {ToastService} from '~/app/core/toast/toast.service';
import {IngridComponent} from '~/app/features/shippings/ingrid/ingrid.component';
import {ADAPTERS, IAdapters} from '~/app/core/adapter';

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
        ShippingFactoryComponent,
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ToastService, useValue: toastServiceSpy},
        {provide: ADAPTERS, useValue: adaptersSpy},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingFactoryComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide a fake container instance and assign it to the ViewChild.
    fakeContainer = new FakeViewContainerRef();
    component.container = signal(fakeContainer as unknown as ViewContainerRef);

    // By default, set adapterId to return undefined.
    componentRef.setInput('adapterId', undefined);
  });

  const setComponentRenderMap = (renderMap: Record<string, any>) => {
    component['SHIPPING_COMPONENTS'] = renderMap as any;
  }

  it('should load the correct shipping component for a valid adapter (Ingrid)', () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.shipping.Ingrid]: IngridComponent,
    })
    componentRef.setInput('adapterId', defaultTestAdapters.shipping.Ingrid);

    // Act
    (component as any).loadShippingComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalled();
    expect(fakeContainer.createComponent).toHaveBeenCalledWith(IngridComponent);
  });

  it('should not load any component if adapterId is not provided', () => {
    // Arrange
    componentRef.setInput('adapterId', undefined);

    // Act
    (component as any).loadShippingComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should not load any shipping component if adapterId is part of PaymentAdapters', () => {
    // Arrange
    componentRef.setInput('adapterId', defaultTestAdapters.payment.Walley);

    // Act
    (component as any).loadShippingComponent(component.adapterId());

    // Assert
    expect(fakeContainer.clear).not.toHaveBeenCalled();
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
    expect(toastServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should call toastService.error if an unknown shipping adapter id is provided', () => {
    // Arrange
    componentRef.setInput('adapterId', 'Invalid');

    // Act
    (component as any).loadShippingComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No shipping component registered for adapter Invalid'
    );
    expect(fakeContainer.createComponent).not.toHaveBeenCalled();
  });

  it('should call toastService.error if container is not available', () => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.shipping.Ingrid]: IngridComponent,
    })
    componentRef.setInput('adapterId', defaultTestAdapters.shipping.Ingrid);
    component.container = signal(undefined);

    // Act
    (component as any).loadShippingComponent(component.adapterId());

    // Assert
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'No container to load shipping component into'
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

  it('should call loadShippingComponent after render (via afterRenderEffect)', (done) => {
    // Arrange
    setComponentRenderMap({
      [defaultTestAdapters.shipping.Ingrid]: IngridComponent,
    })
    spyOn<any>(component, 'loadShippingComponent');
    componentRef.setInput('adapterId', defaultTestAdapters.shipping.Ingrid);

    setTimeout(() => {
      expect((component as any).loadShippingComponent).toHaveBeenCalledWith(
        defaultTestAdapters.shipping.Ingrid
      );
      done();
    }, 0);
  });
});
