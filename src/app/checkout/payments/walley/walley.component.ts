import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WalleyService} from '~/app/checkout/payments/walley/walley.service';
import {distinctUntilChanged, filter, map, take} from 'rxjs';
import {WalleyEvent} from '~/app/checkout/payments/walley/walley.types';
import {DomSanitizer} from '@angular/platform-browser';
import {AsyncPipe} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-script';
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

  html$ = this.walleyService.getPayment().pipe(
    map(walleyOrder => walleyOrder.htmlSnippet),
    filter(html => typeof html !== 'undefined'),
    distinctUntilChanged(),
    map(html => this.domSanitizer.bypassSecurityTrustHtml(html)),
  );
  snippetTargetId = "walley-target";

  constructor() {
    this.orderService.order$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.resume();
    })
  }

  ngOnInit(): void {
    this.html$.subscribe(html => {
      console.log(html);
    });
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

  private handleEvent(event: Event): void {
    const eventName = event.type;
    switch (eventName) {
      case WalleyEvent.CustomerUpdated: {
        this.walleyService.updateCustomer().pipe(
          take(1)
        ).subscribe();
        break;
      }
      case WalleyEvent.ShippingUpdated: {
        this.walleyService.updateShippingOption().pipe(
          take(1)
        ).subscribe();
        break;
      }
      default:
        break;
    }
  }
}
