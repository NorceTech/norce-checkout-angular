import { Component, computed, inject, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, Subject, switchMap } from 'rxjs';
import type { Q1 } from '~/app/features/payments/qliro/qliro.types';
import type { QliroCheckoutShippingMethodChanged } from '~/openapi/qliro-adapter';
import { DomSanitizer } from '@angular/platform-browser';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RunScriptsDirective } from '~/app/shared/directives/run-scripts.directive';
import { SyncService } from '~/app/core/sync/sync.service';
import { Router } from '@angular/router';
import { OrderService } from '~/app/core/order/order.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { derivedAsync } from 'ngxtension/derived-async';
import { QliroService } from '~/app/features/payments/qliro/qliro.service';

@Component({
  selector: 'app-qliro',
  imports: [ProgressSpinner, RunScriptsDirective],
  templateUrl: './qliro.component.html',
})
export class QliroComponent implements OnInit {
  private qliroService = inject(QliroService);
  private orderService = inject(OrderService);
  private domSanitizer = inject(DomSanitizer);
  private syncService = inject(SyncService);
  private router = inject(Router);

  private payment = computed(() => {
    return this.orderService
      .order()
      .payments?.filter((payment) => payment.state !== 'removed')
      .find((payment) => payment.adapterId === this.qliroService.adapterId);
  });
  private paymentId = computed(() => this.payment()?.id);

  html = derivedAsync(() => {
    const paymentId = this.paymentId();
    if (typeof paymentId === 'undefined') return;
    return this.qliroService.getPayment(paymentId).pipe(
      map((qliroOrder) => qliroOrder.htmlSnippet),
      filter((html) => typeof html !== 'undefined'),
      distinctUntilChanged(),
      map((html) => this.domSanitizer.bypassSecurityTrustHtml(html)),
    );
  });

  readonly snippetTargetId = 'qliro-target';

  private customerUpdated$ = new Subject<unknown>();
  private shippingUpdated$ = new Subject<QliroCheckoutShippingMethodChanged>();
  private sessionExpired$ = new Subject<void>();
  private paymentDeclined$ = new Subject<{
    reason: string;
    message?: string;
  }>();

  constructor() {
    this.syncService.hasInFlightRequest$
      .pipe(takeUntilDestroyed())
      .subscribe((hasInFlightRequest) => {
        if (hasInFlightRequest) {
          this.suspend();
        } else {
          this.resume();
        }
      });

    this.customerUpdated$
      .pipe(
        switchMap(() => this.qliroService.updateCustomer(this.paymentId()!)),
      )
      .subscribe(() => this.syncService.triggerRefresh());

    this.shippingUpdated$
      .pipe(
        switchMap((payload) =>
          this.qliroService.updateShippingOption(this.paymentId()!, payload),
        ),
      )
      .subscribe(() => this.syncService.triggerRefresh());

    this.sessionExpired$
      .pipe(
        switchMap(() => this.qliroService.removePayment(this.paymentId()!)),
        switchMap(() => this.qliroService.createPayment()),
      )
      .subscribe(() => this.syncService.triggerRefresh());
  }

  ngOnInit(): void {
    window.q1Ready = this.addEventListeners.bind(this);
  }

  private addEventListeners(q1: Q1): void {
    q1.onCustomerInfoChanged((data) => this.customerUpdated$.next(data));
    q1.onShippingMethodChanged((data) => this.shippingUpdated$.next(data));
    q1.onSessionExpired(() => this.sessionExpired$.next());
    q1.onPaymentDeclined((reason, message) => {
      return this.paymentDeclined$.next({
        reason,
        message,
      });
    });

    q1.onPaymentProcess(
      () => this.syncService._suspend(),
      () => this.syncService._resume(),
    );
  }

  private suspend() {
    if (!window.q1) return;
    window.q1.lock();
  }

  private resume() {
    if (!window.q1) return;
    window.q1.onOrderUpdated(() => {
      window.q1?.unlock();
    });
  }
}
