import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WalleyService} from '~/app/checkout/payments/walley/walley.service';
import {distinctUntilChanged, filter, finalize, map, switchMap, take} from 'rxjs';
import {WalleyEvent} from '~/app/checkout/payments/walley/walley.types';
import {DomSanitizer} from '@angular/platform-browser';
import {AsyncPipe} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-script';
import {SyncService} from '~/app/core/sync/sync.service';
import {Router} from '@angular/router';

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
  private domSanitizer = inject(DomSanitizer);
  private syncService = inject(SyncService);
  private router = inject(Router);

  html$ = this.walleyService.getPayment().pipe(
    map(walleyOrder => walleyOrder.htmlSnippet),
    filter(html => typeof html !== 'undefined'),
    distinctUntilChanged(),
    map(html => this.domSanitizer.bypassSecurityTrustHtml(html)),
  );
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
    if (typeof window?.walley === "undefined") return;
    window.walley.checkout.api.suspend();
  }

  private resume() {
    if (typeof window?.walley === "undefined") return;
    window.walley.checkout.api.resume();
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
        this.walleyService.updateCustomer().pipe(
          take(1),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe();
        break;
      }
      case WalleyEvent.ShippingUpdated: {
        this.walleyService.updateShippingOption().pipe(
          take(1),
          finalize(() => this.syncService.triggerRefresh())
        ).subscribe();
        break;
      }
      case WalleyEvent.Expired: {
        this.walleyService.removePayment().pipe(
          switchMap(() => this.walleyService.createPayment()),
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
