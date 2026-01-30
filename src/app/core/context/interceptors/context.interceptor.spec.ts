import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import {
  EnvironmentInjector,
  provideExperimentalZonelessChangeDetection,
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
  let nextSpy: jasmine.Spy;

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
        provideExperimentalZonelessChangeDetection(),
        { provide: ContextService, useValue: fakeContextService },
      ],
    });

    // Create a sample HTTP request.
    req = new HttpRequest('GET', 'http://example.com');

    // Set up a spy for next() that simulates a succeeding inner interceptor.
    nextSpy = jasmine
      .createSpy('next')
      .and.callFake((request: HttpRequest<any>) =>
        of(new HttpResponse({ status: 200, url: request.url })),
      );
  });

  it('should add x-merchant and x-channel headers to the request', (done) => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    runInInjectionContext(envInjector, () => {
      contextInterceptor(req, nextSpy).subscribe({
        next: () => {
          expect(nextSpy).toHaveBeenCalledTimes(1);
          // The modified request is the argument passed to the next interceptor.
          const modifiedReq = nextSpy.calls.mostRecent()
            .args[0] as HttpRequest<any>;
          expect(modifiedReq.headers.get('x-merchant')).toBe('testMerchant');
          expect(modifiedReq.headers.get('x-channel')).toBe('testChannel');
          done();
        },
        error: done.fail,
      });
    });
  });

  it('should forward the response from next', (done) => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    const expectedResponse = new HttpResponse({ status: 200, url: req.url });
    nextSpy.and.returnValue(of(expectedResponse));
    runInInjectionContext(envInjector, () => {
      contextInterceptor(req, nextSpy).subscribe({
        next: (response) => {
          expect(response).toBe(expectedResponse);
          done();
        },
        error: done.fail,
      });
    });
  });

  it('should propagate errors from next', (done) => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    const errorResponse = new Error('Test error');
    nextSpy.and.returnValue(throwError(() => errorResponse));
    runInInjectionContext(envInjector, () => {
      contextInterceptor(req, nextSpy).subscribe({
        next: () => {
          done.fail('Expected error, but received a response');
        },
        error: (err) => {
          expect(err).toBe(errorResponse);
          done();
        },
      });
    });
  });
});
