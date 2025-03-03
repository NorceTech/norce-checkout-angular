import {Component, computed, inject, OnDestroy, OnInit} from '@angular/core';
import {WalleyService} from '~/app/features/payments/walley/walley.service';
import {distinctUntilChanged, filter, map, Subject, switchMap} from 'rxjs';
import {WalleyEvent, WindowWalley} from '~/app/features/payments/walley/walley.types';
import {DomSanitizer} from '@angular/platform-browser';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-scripts.directive';
import {SyncService} from '~/app/core/sync/sync.service';
import {Router} from '@angular/router';
import {OrderService} from '~/app/core/order/order.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {derivedAsync} from 'ngxtension/derived-async';

@Component({
  selector: 'app-walley',
  imports: [
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

  private paymentId = computed(() => {
    return this.orderService.order()
      .payments
      ?.filter(payment => payment.state !== 'removed')
      .find(payment => payment.adapterId === this.walleyService.adapterId)
      ?.id
  })

  html = derivedAsync(() => {
    const paymentId = this.paymentId();
    if (typeof paymentId === 'undefined') return;
    return this.walleyService.getPayment(paymentId).pipe(
      map(walleyOrder => walleyOrder.htmlSnippet),
      filter(html => typeof html !== 'undefined'),
      distinctUntilChanged(),
      map(html => this.domSanitizer.bypassSecurityTrustHtml(html)),
    )
  })

  readonly snippetTargetId = "walley-target";

  private customerUpdated$ = new Subject<void>();
  private shippingUpdated$ = new Subject<void>();
  private expired$ = new Subject<void>();

  constructor() {
    this.syncService.hasInFlightRequest$.pipe(takeUntilDestroyed())
      .subscribe(hasInFlightRequest => {
        if (hasInFlightRequest) {
          this.suspend();
        } else {
          this.resume();
        }
      })

    this.customerUpdated$.pipe(
      switchMap(() => this.walleyService.updateCustomer(this.paymentId()!))
    ).subscribe(() => this.syncService.triggerRefresh());

    this.shippingUpdated$.pipe(
      switchMap(() => this.walleyService.updateShippingOption(this.paymentId()!))
    ).subscribe(() => this.syncService.triggerRefresh());

    this.expired$.pipe(
      switchMap(() => this.walleyService.removePayment(this.paymentId()!)),
      switchMap(() => this.walleyService.createPayment())
    ).subscribe(() => this.syncService.triggerRefresh());
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
        this.customerUpdated$.next();
        break;
      }
      case WalleyEvent.ShippingUpdated: {
        this.shippingUpdated$.next();
        break;
      }
      case WalleyEvent.Expired: {
        this.expired$.next();
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
