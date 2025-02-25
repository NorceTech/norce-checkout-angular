import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WalleyService} from '~/app/features/payments/walley/walley.service';
import {distinctUntilChanged, filter, finalize, map, shareReplay, switchMap, take} from 'rxjs';
import {WalleyEvent, WindowWalley} from '~/app/features/payments/walley/walley.types';
import {DomSanitizer} from '@angular/platform-browser';
import {AsyncPipe} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-scripts.directive';
import {SyncService} from '~/app/core/sync/sync.service';
import {Router} from '@angular/router';
import {ContextService} from '~/app/core/context/context.service';
import {OrderService} from '~/app/core/order/order.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  private paymentId$ = this.orderService.getPayment(this.walleyService.adapterId)
    .pipe(
      map(payment => payment.id),
      filter(id => typeof id !== 'undefined'),
      distinctUntilChanged(),
      shareReplay(1),
    );

  html$ = this.paymentId$.pipe(
    switchMap(paymentId => this.walleyService.getPayment(paymentId)),
    map(walleyOrder => walleyOrder.htmlSnippet),
    filter(html => typeof html !== 'undefined'),
    map(html => this.domSanitizer.bypassSecurityTrustHtml(html)),
    distinctUntilChanged(),
    shareReplay(1),
  )
  readonly snippetTargetId = "walley-target";

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
        this.paymentId$.pipe(
          take(1),
          switchMap(paymentId => {
            return this.walleyService.updateCustomer(paymentId)
          }),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe();
        break;
      }
      case WalleyEvent.ShippingUpdated: {
        this.paymentId$.pipe(
          take(1),
          switchMap(paymentId => {
            return this.walleyService.updateShippingOption(paymentId)
          }),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe()
        break;
      }
      case WalleyEvent.Expired: {
        this.paymentId$
          .pipe(
            take(1),
            switchMap(paymentId => {
              return this.walleyService.removePayment(paymentId).pipe(
                switchMap(() => this.walleyService.createPayment())
              )
            }),
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
