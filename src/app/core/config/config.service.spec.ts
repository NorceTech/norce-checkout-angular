import {TestBed} from '@angular/core/testing';
import {ConfigService} from './config.service';
import {ContextService} from '~/app/core/context/context.service';
import {DataService} from '~/app/core/config/data.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {of, throwError} from 'rxjs';
import {provideExperimentalZonelessChangeDetection, signal} from '@angular/core';
import {Configuration} from '~/openapi/configuration';
import {Context} from '~/app/core/entities/Context';

describe('ConfigService', () => {
  let service: ConfigService;
  let contextService: jasmine.SpyObj<ContextService>;
  let dataService: jasmine.SpyObj<DataService>;
  let toastService: jasmine.SpyObj<ToastService>;

  // Mock data
  const mockContext = new Context({
    merchant: 'merchant',
    channel: 'channel',
    orderId: 'orderId',
  })
  const contextSignal = signal(mockContext);
  const mockConfigs: Configuration[] = [{$schema: 'Config1', id: '1'}, {$schema: 'Config2', id: '2'}];

  beforeEach(() => {
    contextService = jasmine.createSpyObj('ContextService', [], {
      context: contextSignal
    });
    dataService = jasmine.createSpyObj('DataService', ['getConfigs']);
    toastService = jasmine.createSpyObj('ToastService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        ConfigService,
        {provide: ContextService, useValue: contextService},
        {provide: DataService, useValue: dataService},
        {provide: ToastService, useValue: toastService}
      ]
    });

    service = TestBed.inject(ConfigService);
  });

  it('should return configs when context exists', () => {
    dataService.getConfigs.and.returnValue(of(mockConfigs));

    expect(service.configs()).toEqual(mockConfigs);
    expect(dataService.getConfigs).toHaveBeenCalledWith(mockContext);
  });

  it('should return empty array when context does not exist', () => {
    contextService.context.and.returnValue(undefined);

    expect(service.configs()).toEqual([]);
    expect(dataService.getConfigs).not.toHaveBeenCalled();
  });

  it('should show error toast when fetching configs fails', () => {
    dataService.getConfigs.and.returnValue(throwError(() => new Error('API error')));

    expect(service.configs()).toEqual([]);
    expect(toastService.error).toHaveBeenCalled();
  });

  it('should retry fetching configs twice before showing error toast', () => {
    dataService.getConfigs.and.returnValues(
      throwError(() => new Error('API error')),
      throwError(() => new Error('API error')),
      of(mockConfigs)
    );

    expect(service.configs()).toEqual(mockConfigs);
    expect(dataService.getConfigs).toHaveBeenCalledTimes(3);
    expect(toastService.error).not.toHaveBeenCalled();
  });

  it('should handle context changes and refetch configs', () => {
    const otherConfigs = mockConfigs.map(c => ({...c, id: `other-${c.id}`}));
    dataService.getConfigs.and.returnValue(of(otherConfigs));

    expect(service.configs()).toEqual(mockConfigs);
    expect(dataService.getConfigs).toHaveBeenCalledWith(mockContext);

    // Change the context
    const newContext = new Context({
      merchant: 'newMerchant',
      channel: 'newChannel',
      orderId: 'newOrderId',
    });
    contextSignal.set(newContext);

    expect(service.configs()).toEqual(mockConfigs);
    expect(dataService.getConfigs).toHaveBeenCalledWith(newContext);
  });
});
