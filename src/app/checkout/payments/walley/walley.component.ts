import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WalleyService} from '~/app/checkout/payments/walley/walley.service';
import {
  combineLatestWith,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  finalize,
  map,
  switchMap,
  take
} from 'rxjs';
import {WalleyEvent, WindowWalley} from '~/app/checkout/payments/walley/walley.types';
import {DomSanitizer} from '@angular/platform-browser';
import {AsyncPipe} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-script';
import {SyncService} from '~/app/core/sync/sync.service';
import {Router} from '@angular/router';
import {ContextService} from '~/app/core/context/context.service';
import {Adapter} from '~/app/core/adapter';
import {OrderService} from '~/app/core/order/order.service';

@Component({
  selector: 'app-walley',
  imports: [
    AsyncPipe,
    ProgressSpinner,
    RunScriptsDirective
  ],
  templateUrl: './walley.component.html',
})
export class WalleyComponent implements OnInit, OnDestroy {
  private walleyService = inject(WalleyService);
  private orderService = inject(OrderService);
  private domSanitizer = inject(DomSanitizer);
  private syncService = inject(SyncService);
  private router = inject(Router);

  private contextService = inject(ContextService);
  private orderPayment$ = this.orderService.getPayment(Adapter.Walley).pipe(
    distinctUntilKeyChanged('id'),
  );

  html$ = this.contextService.context$.pipe(
    combineLatestWith(this.orderPayment$),
    distinctUntilChanged(([, prevPayment], [, nextPayment]) => {
      return prevPayment?.id === nextPayment?.id
    }),
    switchMap(([ctx, payment]) => {
      return this.walleyService.getPayment(ctx.orderId, payment.id!).pipe(
        map(walleyOrder => walleyOrder.htmlSnippet),
        filter(html => typeof html !== 'undefined'),
        map(html => this.domSanitizer.bypassSecurityTrustHtml(html)),
      );
    }),
    distinctUntilChanged()
  )
  readonly snippetTargetId = "walley-target";

  constructor() {
    this.syncService.hasInFlightRequest$.subscribe(hasInFlightRequest => {
      if (hasInFlightRequest) {
        this.suspend();
      } else {
        this.resume();
      }
    })
  }

  ngOnInit(): void {
    this.addEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  private suspend() {
    const walley = (window as WindowWalley).walley;
    if (typeof walley === "undefined") return;
    walley.checkout.api.suspend();
  }

  private resume() {
    const walley = (window as WindowWalley).walley;
    if (typeof walley === "undefined") return;
    walley.checkout.api.resume();
  }

  private addEventListeners() {
    Object.values(WalleyEvent).forEach((eventName) => {
      document.addEventListener(eventName, this.handleEvent.bind(this));
    });
  }

  private removeEventListeners() {
    Object.values(WalleyEvent).forEach((eventName) => {
      document.removeEventListener(eventName, this.handleEvent.bind(this));
    });
  }

  private async handleEvent(event: Event): Promise<void> {
    const eventName = event.type;
    switch (eventName) {
      case WalleyEvent.CustomerUpdated: {
        this.contextService.context$.pipe(
          combineLatestWith(this.orderPayment$),
          switchMap(([ctx, payment]) => {
            return this.walleyService.updateCustomer(ctx, payment.id!)
          }),
          take(1),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe();
        break;
      }
      case WalleyEvent.ShippingUpdated: {
        this.contextService.context$.pipe(
          combineLatestWith(this.orderPayment$),
          switchMap(([ctx, payment]) => {
            return this.walleyService.updateShippingOption(ctx, payment.id!)
          }),
          take(1),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe();
        break;
      }
      case WalleyEvent.Expired: {
        this.contextService.context$.pipe(
          combineLatestWith(this.orderPayment$),
          switchMap(([ctx, payment]) => {
            return this.walleyService.removePayment(ctx.orderId, payment.id!).pipe(
              switchMap(() => this.walleyService.createPayment(ctx.orderId))
            )
          }),
          take(1),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe();
        break;
      }
      case WalleyEvent.PurchaseCompleted: {
        await this.router.navigate(['/confirmation'], {queryParamsHandling: 'preserve'});
        break;
      }
      default:
        break;
    }
  }
}
