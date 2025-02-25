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
    mockOrder$.next({cart: {items: mockItems}});
    orderService = jasmine.createSpyObj('OrderService', [], {
      order$: mockOrder$,
    });
    platformAdapterService = jasmine.createSpyObj('PlatformAdapterService', [
      'updateItem',
      'removeItem',
    ]);
    syncService = jasmine.createSpyObj('SyncService', ['triggerRefresh']);

    platformAdapterService.removeItem.and.returnValue(of(undefined));
    platformAdapterService.updateItem.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        CartService,
        {provide: OrderService, useValue: orderService},
        {provide: PlatformAdapterService, useValue: platformAdapterService},
        {provide: SyncService, useValue: syncService},
      ],
    });

    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize items from order$', () => {
    expect(service.items()).toEqual(mockItems);
  });

  describe('removeItem$', () => {
    it('should remove item from items array', () => {
      const itemToRemove = mockItems[0];

      service.removeItem$.next(itemToRemove);

      expect(service.items()).toEqual([mockItems[1]]);
      expect(platformAdapterService.removeItem).toHaveBeenCalledWith(itemToRemove);
      expect(syncService.triggerRefresh).toHaveBeenCalled();
    });

    it('should not explode for non existent item', () => {
      const nonExistentItem = {id: '999', name: 'Non-existent', quantity: 3};

      service.removeItem$.next(nonExistentItem);

      expect(platformAdapterService.removeItem).toHaveBeenCalled();
      expect(syncService.triggerRefresh).toHaveBeenCalled();
      expect(service.items()).toEqual(mockItems);
    });
  });

  describe('updateItem$', () => {
    it('should update existing item in items array', () => {
      const updatedItem = {...mockItems[0], quantity: 3};

      service.updateItem$.next(updatedItem);

      expect(service.items()).toEqual([updatedItem, mockItems[1]]);
      expect(platformAdapterService.updateItem).toHaveBeenCalledWith(updatedItem);
      expect(syncService.triggerRefresh).toHaveBeenCalled();
    });

    it('should not explode for non existent item', () => {
      const nonExistentItem = {id: '999', name: 'Non-existent', quantity: 3};

      service.updateItem$.next(nonExistentItem);

      expect(platformAdapterService.updateItem).toHaveBeenCalled();
      expect(syncService.triggerRefresh).toHaveBeenCalled();
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
