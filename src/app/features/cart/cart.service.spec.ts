import {TestBed} from '@angular/core/testing';
import {provideExperimentalZonelessChangeDetection} from '@angular/core';
import {CartService} from './cart.service';
import {OrderService} from '~/app/core/order/order.service';
import {PlatformAdapterService} from '~/app/core/platform/platform';
import {SyncService} from '~/app/core/sync/sync.service';
import {BehaviorSubject, of} from 'rxjs';
import {Item} from '~/openapi/order';

describe('CartService', () => {
  let service: CartService;
  let orderService: jasmine.SpyObj<OrderService>;
  let platformAdapterService: jasmine.SpyObj<PlatformAdapterService>;
  let syncService: jasmine.SpyObj<SyncService>;

  const mockItems: Item[] = [
    {id: '1', name: 'Item 1', quantity: 1},
    {id: '2', name: 'Item 2', quantity: 2},
  ];

  const mockOrder$ = new BehaviorSubject({cart: {items: mockItems}});

  beforeEach(() => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', [], {
      order$: null,
    });
    const platformAdapterServiceSpy = jasmine.createSpyObj('PlatformAdapterService', [
      'updateItem',
      'removeItem',
    ]);
    const syncServiceSpy = jasmine.createSpyObj('SyncService', ['triggerRefresh']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        CartService,
        {provide: OrderService, useValue: orderServiceSpy},
        {provide: PlatformAdapterService, useValue: platformAdapterServiceSpy},
        {provide: SyncService, useValue: syncServiceSpy},
      ],
    });


    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    platformAdapterService = TestBed.inject(
      PlatformAdapterService,
    ) as jasmine.SpyObj<PlatformAdapterService>;
    syncService = TestBed.inject(SyncService) as jasmine.SpyObj<SyncService>;

    platformAdapterService.removeItem.and.returnValue(of(undefined));
  });

  it('should be created', () => {
    service = TestBed.inject(CartService);
    expect(service).toBeTruthy();
  });

  it('should initialize items from order$', () => {
    service = TestBed.inject(CartService);
    expect(service.items()).toEqual(mockItems);
  });

  describe('removeItem$', () => {
    it('should remove item from items array', async () => {
      const itemToRemove = mockItems[0];

      service = TestBed.inject(CartService);
      service.removeItem$.next(itemToRemove);

      // Optimistically removes
      expect(service.items()).toEqual([mockItems[1]]);
      // Does the actual remove
      expect(platformAdapterService.removeItem).toHaveBeenCalledWith(itemToRemove);
      expect(syncService.triggerRefresh).toHaveBeenCalled();
    });

    it('should do nothing for non-existing item', () => {
      const nonExistentItem = {id: '999', name: 'Non-existent', quantity: 3};

      service = TestBed.inject(CartService);
      service.removeItem$.next(nonExistentItem);

      expect(platformAdapterService.removeItem).not.toHaveBeenCalled();
      expect(syncService.triggerRefresh).not.toHaveBeenCalled();
      expect(service.items()).toEqual(mockItems);
    });
  });

  describe('updateItem$', () => {
    it('should update existing item in items array', () => {
      const updatedItem = {...mockItems[0], quantity: 3};

      service = TestBed.inject(CartService);
      service.updateItem$.next(updatedItem);

      // Optimistically updates
      expect(service.items()).toEqual([updatedItem, mockItems[1]]);
      // Does the actual update
      expect(platformAdapterService.updateItem).toHaveBeenCalledWith(updatedItem);
      expect(syncService.triggerRefresh).toHaveBeenCalled();
    });

    it('should do nothing for non-existing item', () => {
      const nonExistentItem = {id: '999', name: 'Non-existent', quantity: 3};

      service.updateItem$.next(nonExistentItem);
      expect(platformAdapterService.updateItem).not.toHaveBeenCalled();
      expect(syncService.triggerRefresh).not.toHaveBeenCalled();
      expect(service.items()).toEqual(mockItems);
    });
  });

  describe('order$ updates', () => {
    it('should update items when order$ emits new values', () => {
      const newItems: Item[] = [{id: '3', name: 'Item 3', quantity: 1}];
      mockOrder$.next({cart: {items: newItems}});
      expect(service.items()).toEqual(newItems);
    });

    it('should handle empty cart in order', () => {
      mockOrder$.next({cart: {items: []}});
      expect(service.items()).toEqual([]);
    });
  });
});
