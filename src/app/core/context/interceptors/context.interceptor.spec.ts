import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import {
  EnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
  signal,
} from '@angular/core';

import { contextInterceptor } from './context.interceptor';
import { ContextService } from '~/app/core/context/context.service';
import { Context } from '~/app/core/entities/context';

describe('contextInterceptor', () => {
  let fakeContext: Context;
  let fakeContextService: Partial<ContextService>;
  let req: HttpRequest<any>;
  let nextSpy: Mock;

  beforeEach(() => {
    // Fake a valid Context instance.
    fakeContext = new Context({
      merchant: 'testMerchant',
      channel: 'testChannel',
      orderId: '1234',
    });

    // Provide a fake ContextService that emits our fakeContext.
    fakeContextService = {
      context: signal(fakeContext),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContextService, useValue: fakeContextService },
      ],
    });

    // Create a sample HTTP request.
    req = new HttpRequest('GET', 'http://example.com');

    // Set up a spy for next() that simulates a succeeding inner interceptor.
    nextSpy = vi
      .fn()
      .mockImplementation((request: HttpRequest<any>) =>
        of(new HttpResponse({ status: 200, url: request.url })),
      );
  });

  it('should add x-merchant and x-channel headers to the request', async () => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    await runInInjectionContext(envInjector, async () => {
      await firstValueFrom(contextInterceptor(req, nextSpy));
      expect(nextSpy).toHaveBeenCalledTimes(1);
      // The modified request is the argument passed to the next interceptor.
      const modifiedReq = vi.mocked(nextSpy).mock
        .lastCall?.[0] as HttpRequest<any>;
      expect(modifiedReq.headers.get('x-merchant')).toBe('testMerchant');
      expect(modifiedReq.headers.get('x-channel')).toBe('testChannel');
    });
  });

  it('should forward the response from next', async () => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    const expectedResponse = new HttpResponse({ status: 200, url: req.url });
    nextSpy.mockReturnValue(of(expectedResponse));
    await runInInjectionContext(envInjector, async () => {
      const response = await firstValueFrom(contextInterceptor(req, nextSpy));
      expect(response).toBe(expectedResponse);
    });
  });

  it('should propagate errors from next', async () => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    const errorResponse = new Error('Test error');
    nextSpy.mockReturnValue(throwError(() => errorResponse));
    await runInInjectionContext(envInjector, async () => {
      await expect(
        firstValueFrom(contextInterceptor(req, nextSpy)),
      ).rejects.toThrow('Test error');
    });
  });
});
