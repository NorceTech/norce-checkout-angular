import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Params} from '@angular/router';
import {Subject} from 'rxjs';

import {ContextService} from './context.service';
import {Context} from '~/app/core/entities/Context';
import {ContextError, ContextErrorCode} from '~/app/core/entities/errors/ContextError';
import {environment} from '~/environments/environment';
import {provideExperimentalZonelessChangeDetection} from '@angular/core';

describe('ContextService', () => {
  let contextService: ContextService;
  let queryParamsSubject: Subject<Params>;
  const originalEnvContext = environment.context;

  beforeEach(() => {
    queryParamsSubject = new Subject<Params>();

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        ContextService,
        {
          provide: ActivatedRoute,
          useValue: {queryParams: queryParamsSubject.asObservable()},
        },
      ],
    });

    // Ensure that, by default, environment.context is unset
    // so the service falls back to query param values.
    environment.context = undefined;
    contextService = TestBed.inject(ContextService);
  });

  afterEach(() => {
    environment.context = originalEnvContext;
  });

  it('should emit a valid context for valid query params', (done) => {
    const emitted: Context[] = [];
    contextService.context$.subscribe({
      next: (value) => emitted.push(value),
      error: (err) => done.fail(err),
    });

    // Emit a valid set of query parameters.
    queryParamsSubject.next({
      orderId: 'id1',
      merchant: 'm1',
      channel: 'ch1',
    });

    // The first pair is [empty, validParams] so a valid Context is emitted.
    expect(emitted.length).toBe(1);
    const ctx = emitted[0];
    expect(ctx.orderId).toBe('id1');
    expect(ctx.merchant).toBe('m1');
    expect(ctx.channel).toBe('ch1');
    done();
  });

  it('should throw ContextError if required parameters are missing', (done) => {
    contextService.context$.subscribe({
      next: () => {
        done.fail('Expected error but received a context emission');
      },
      error: (err) => {
        expect(err).toBeInstanceOf(ContextError);
        expect(err.code).toBe(ContextErrorCode.ContextNotAvailable);
        done();
      },
    });

    // Emit query params missing "orderId".
    queryParamsSubject.next({
      merchant: 'm1',
      channel: 'ch1',
    });
  });

  it('should prioritize environment context over query params for merchant and channel', (done) => {
    // Set environment values.
    environment.context = {
      merchant: 'envMerchant',
      channel: 'envChannel',
    };
    const emitted: Context[] = [];
    contextService.context$.subscribe({
      next: (value) => emitted.push(value),
      error: (err) => done.fail(err),
    });

    // Even though query params provide merchant and channel,
    // the service should use the environment values.
    queryParamsSubject.next({
      orderId: 'id2',
      merchant: 'queryMerchant',
      channel: 'queryChannel',
    });

    expect(emitted.length).toBe(1);
    const ctx = emitted[0];
    expect(ctx.orderId).toBe('id2');
    expect(ctx.merchant).toBe('envMerchant');
    expect(ctx.channel).toBe('envChannel');
    done();
  });

  it('should emit a new context when query params change', (done) => {
    const emitted: Context[] = [];
    contextService.context$.subscribe({
      next: (value) => emitted.push(value),
      error: (err) => done.fail(err),
    });

    // First valid emission.
    queryParamsSubject.next({
      orderId: 'id1',
      merchant: 'm1',
      channel: 'ch1',
    });
    // Second emission with a different "orderId" triggers a new Context.
    queryParamsSubject.next({
      orderId: 'id2',
      merchant: 'm1',
      channel: 'ch1',
    });

    expect(emitted.length).toBe(2);
    expect(emitted[0].orderId).toBe('id1');
    expect(emitted[1].orderId).toBe('id2');
    done();
  });

  it('should not emit a new context if query params have not changed', (done) => {
    const emitted: Context[] = [];
    contextService.context$.subscribe({
      next: (value) => emitted.push(value),
      error: (err) => done.fail(err),
    });

    // First valid emission.
    queryParamsSubject.next({
      orderId: 'id1',
      merchant: 'm1',
      channel: 'ch1',
    });
    // Emitting the same parameters should not produce a new context due to filtering.
    queryParamsSubject.next({
      orderId: 'id1',
      merchant: 'm1',
      channel: 'ch1',
    });

    // Only one context should be emitted.
    expect(emitted.length).toBe(1);
    done();
  });

  it('should not emit a new context if only irrelevant query params change', (done) => {
    const emitted: Context[] = [];
    contextService.context$.subscribe({
      next: (value) => emitted.push(value),
      error: (err) => done.fail(err),
    });

    // Emit initial valid query parameters.
    queryParamsSubject.next({
      orderId: 'id1',
      merchant: 'm1',
      channel: 'ch1',
    });

    // Emit new query params with an extra irrelevant parameter added.
    queryParamsSubject.next({
      orderId: 'id1',
      merchant: 'm1',
      channel: 'ch1',
      extra: 'irrelevant',
    });

    // Because the relevant parameters remain the same,
    // no new context should be emitted.
    expect(emitted.length).toBe(1);
    done();
  });
});
