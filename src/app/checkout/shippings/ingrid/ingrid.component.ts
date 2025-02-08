import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {DomSanitizer} from '@angular/platform-browser';
import {SyncService} from '~/app/core/sync/sync.service';
import {ContextService} from '~/app/core/context/context.service';
import {
  bindCallback,
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  retry,
  shareReplay,
  switchMap,
  take,
  tap
} from 'rxjs';
import {IngridService} from '~/app/checkout/shippings/ingrid/ingrid.service';
import {AsyncPipe} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-scripts.directive';
import {IngridApi, IngridEventName, WindowIngrid} from '~/app/checkout/shippings/ingrid/ingrid.types';
import {ToastService} from '~/app/core/toast/toast.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ingrid',
  imports: [
    AsyncPipe,
    ProgressSpinner,
    RunScriptsDirective
  ],
  templateUrl: './ingrid.component.html',
})
export class IngridComponent implements OnInit {
  private ingridService = inject(IngridService);
  private orderService = inject(OrderService);
  private domSanitizer = inject(DomSanitizer);
  private syncService = inject(SyncService);
  private toastService = inject(ToastService);

  private contextService = inject(ContextService);

  snippetTargetId = "ingrid-target";

  private shippingId$ = this.orderService.nonRemovedShippings$.pipe(
    map(shippings => {
      return shippings.find(shipping => shipping.adapterId === this.ingridService.adapterId)?.id;
    }),
    filter(shippingId => typeof shippingId !== 'undefined'),
    distinctUntilChanged(),
    shareReplay(1),
  )

  private ingridSession = this.contextService.context$.pipe(
    combineLatestWith(this.shippingId$),
    switchMap(([ctx, shippingId]) => {
      return this.ingridService.getShipping(ctx.orderId, shippingId)
    }),
    tap(() => console.log('Ingrid session updated')),
    shareReplay(1),
  );
  html$ = this.ingridSession.pipe(
    map(ingridSession => ingridSession.htmlSnippet),
    filter(html => typeof html !== 'undefined'),
    distinctUntilChanged(),
    map(html => this.domSanitizer.bypassSecurityTrustHtml(html)),
  );

  constructor() {
    this.syncService.hasInFlightRequest$.pipe(takeUntilDestroyed())
      .subscribe(hasInFlightRequest => {
        if (hasInFlightRequest) {
          this.suspend();
        } else {
          this.resume();
        }
      })
  }

  ngOnInit(): void {
    this.html$.pipe(
      tap(() => console.log('Ingrid HTML updated')),
      switchMap(() => bindCallback(this.addEventListeners.bind(this)).call(undefined)),
      retry({
        count: 2,
        delay: 100
      }),
      catchError((error) => {
        this.toastService.error('Failed to add ingrid event listeners');
        return EMPTY;
      })
    ).subscribe()
  }

  private suspend() {
    const _sw = (window as WindowIngrid)._sw;
    if (typeof _sw === "undefined") return;
    _sw((api: IngridApi) => {
      api.suspend();
    })
  }

  private resume() {
    const _sw = (window as WindowIngrid)._sw;
    if (typeof _sw === "undefined") return;
    _sw((api: IngridApi) => {
      api.resume();
    })
  }

  private addEventListeners() {
    const _sw = (window as WindowIngrid)._sw;
    if (typeof _sw === "undefined") {
      throw new Error('Ingrid API not found');
    }
    _sw((api: IngridApi) => {
      api.on(IngridEventName.SummaryChanged, (data, meta) => {
        this.contextService.context$.pipe(
          combineLatestWith(this.shippingId$),
          take(1),
          switchMap(([ctx, shippingId]) => {
            return this.ingridService.updateCustomer(ctx.orderId, shippingId)
          }),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe()
      });

      api.on(IngridEventName.DataChanged, (data, meta) => {
        if (meta?.initial_load) return;
        this.contextService.context$.pipe(
          combineLatestWith(this.shippingId$),
          take(1),
          switchMap(([ctx, shippingId]) => {
            return this.ingridService.updateShipping(ctx.orderId, shippingId)
          }),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe()
      })
    })
  }
}
