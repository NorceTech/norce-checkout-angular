import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {provideExperimentalZonelessChangeDetection} from '@angular/core';
import {ConfigService} from './config.service';
import {DataService} from '~/app/core/config/data.service';
import {ContextService} from '~/app/core/context/context.service';
import {ToastService} from '~/app/core/toast/toast.service';
import {Context} from '~/app/core/entities/Context';

describe('ConfigService', () => {
  let service: ConfigService;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let contextServiceStub: Partial<ContextService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let fakeContext: Context;

  beforeEach(() => {
    // Create a real instance of Context
    fakeContext = new Context({
      merchant: 'testMerchant',
      channel: 'testChannel',
      orderId: '1234',
    });

    // Stub the ContextService to immediately emit fakeContext.
    contextServiceStub = {
      context$: of(fakeContext),
    };

    // Create spy objects for DataService and ToastService.
    dataServiceSpy = jasmine.createSpyObj('DataService', ['getConfig', 'getConfigs']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: DataService, useValue: dataServiceSpy},
        {provide: ContextService, useValue: contextServiceStub},
        {provide: ToastService, useValue: toastServiceSpy},
        ConfigService,
      ],
    });

    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
