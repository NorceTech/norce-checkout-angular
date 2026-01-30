import { Component, computed, inject } from '@angular/core';
import { KustomService } from '~/app/features/payments/kustom/kustom.service';
import {
  bindCallback,
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  retry,
  Subject,
  switchMap,
} from 'rxjs';
import {
  KlarnaApi,
  KlarnaEvent,
  WindowKlarna,
} from '~/app/features/payments/kustom/kustom.types';
import { DomSanitizer } from '@angular/platform-browser';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RunScriptsDirective } from '~/app/shared/directives/run-scripts.directive';
import { SyncService } from '~/app/core/sync/sync.service';
import { Router } from '@angular/router';
import { OrderService } from '~/app/core/order/order.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { derivedAsync } from 'ngxtension/derived-async';
import { ToastService } from '~/app/core/toast/toast.service';
import { ContextService } from '~/app/core/context/context.service';

@Component({
  selector: 'app-kustom',
  imports: [ProgressSpinner, RunScriptsDirective],
  templateUrl: './kustom.component.html',
})
export class KustomComponent {
  private kustomService = inject(KustomService);
  private orderService = inject(OrderService);
  private domSanitizer = inject(DomSanitizer);
  private syncService = inject(SyncService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private contextService = inject(ContextService);

  private paymentId = computed(() => {
    return this.orderService
      .order()
      .payments?.filter((payment) => payment.state !== 'removed')
      .find((payment) => payment.adapterId === this.kustomService.adapterId)
      ?.id;
  });

  html = derivedAsync(() => {
    const paymentId = this.paymentId();
    if (typeof paymentId === 'undefined') return;
    return this.kustomService.getPayment(paymentId).pipe(
      map((klarnaOrder) => klarnaOrder.htmlSnippet),
      filter((html) => typeof html !== 'undefined'),
      distinctUntilChanged(),
      map((html) => this.domSanitizer.bypassSecurityTrustHtml(html)),
    );
  });

  readonly snippetTargetId = 'klarna-checkout-container';

  private addressChanged$ = new Subject<void>();
  private shippingOptionChanged$ = new Subject<void>();
  private redirectInitiated$ = new Subject<void>();

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

    this.addressChanged$
      .pipe
      // Kustom has backend callbacks which the adapter listens to, so this is optional
      // We can just trigger a refresh to get the latest data

      // switchMap(() => this.kustomService.updateAddress(this.paymentId()!).pipe(
      //   catchError(() => {
      //     this.syncService.triggerRefresh()
      //     return EMPTY;
      //   })
      // )),
      ()
      .subscribe(() => this.syncService.triggerRefresh());

    this.shippingOptionChanged$
      .pipe
      // Kustom has backend callbacks which the adapter listens to, so this is optional
      // We can just trigger a refresh to get the latest data

      // switchMap(() => this.kustomService.updateShippingOption(this.paymentId()!).pipe(
      //   catchError(() => {
      //     this.syncService.triggerRefresh()
      //     return EMPTY;
      //   })
      // )),
      ()
      .subscribe(() => this.syncService.triggerRefresh());

    this.redirectInitiated$
      .pipe(switchMap(() => this.kustomService.getPayment(this.paymentId()!)))
      .subscribe(() => {
        // Check order status and navigate to confirmation if complete
      });

    toObservable(this.html)
      .pipe(
        takeUntilDestroyed(),
        switchMap(() =>
          bindCallback(this.addEventListeners.bind(this)).call(undefined),
        ),
        retry({
          count: 10,
          delay: 100,
        }),
        catchError(() => {
          this.toastService.error('Failed to add kustom event listeners');
          return EMPTY;
        }),
      )
      .subscribe();
  }

  private suspend() {
    const klarnaApi = (window as WindowKlarna)._klarnaCheckout;
    if (typeof klarnaApi === 'undefined') return;
    if (!klarnaApi) return;
    klarnaApi((api) => api.suspend());
  }

  private resume() {
    const klarnaApi = (window as WindowKlarna)._klarnaCheckout;
    if (typeof klarnaApi === 'undefined') return;
    if (!klarnaApi) return;
    klarnaApi((api) => api.resume());
  }

  private addEventListeners() {
    const klarnaApi = (window as WindowKlarna)._klarnaCheckout;
    if (typeof klarnaApi === 'undefined') {
      throw new Error('Kustom API not found');
    }
    klarnaApi((api: KlarnaApi) => {
      api.on({
        [KlarnaEvent.BillingAddressChange]: () => this.addressChanged$.next(),
        [KlarnaEvent.ShippingAddressChange]: () => this.addressChanged$.next(),
        [KlarnaEvent.ShippingOptionChange]: () =>
          this.shippingOptionChanged$.next(),
        [KlarnaEvent.RedirectInitiated]: () => this.redirectInitiated$.next(),
        [KlarnaEvent.LoadConfirmation]: () =>
          this.handleLoadConfirmation.bind(this),
        [KlarnaEvent.CanNotCompleteOrder]: () =>
          this.handleCanNotCompleteOrder.bind(this),
        [KlarnaEvent.NetworkError]: () => this.handleNetworkError.bind(this),
        [KlarnaEvent.ValidationCallback]:
          this.handleValidationCallback.bind(this),
      });
    });
  }

  private async handleLoadConfirmation(): Promise<void> {
    await this.router.navigate(['/confirmation'], {
      queryParamsHandling: 'preserve',
    });
  }

  private handleCanNotCompleteOrder(): void {
    // Merchant needs to provide alternative payment options
    // Could emit an event or call a service to handle this
  }

  private handleNetworkError(): void {
    // Handle network error - could show toast or retry
  }

  private handleValidationCallback(
    _: never,
    callback: (result: { should_proceed: boolean; message?: string }) => void,
  ): void {
    const orderId = this.contextService.context()?.orderId;
    this.orderService.validateOrder(orderId!).subscribe({
      next: () => {
        callback({ should_proceed: true });
      },
      error: () => {
        callback({ should_proceed: false, message: 'Order validation failed' });
      },
    });
  }
}
