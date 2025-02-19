import {Component, DestroyRef, inject, OnDestroy, OnInit} from '@angular/core';
import {AdyenService} from '~/app/features/payments/adyen/adyen.service';
import {OrderService} from '~/app/core/order/order.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {combineLatestWith, filter, finalize, map, shareReplay, switchMap, take} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {ProgressSpinner} from 'primeng/progressspinner';
import AdyenCheckout from '@adyen/adyen-web';
// @ts-ignore
import type DropinElement from '@adyen/adyen-web/dist/types/components/Dropin';
// @ts-ignore
import {CoreOptions} from '@adyen/adyen-web/dist/types/core/types';
// @ts-ignore
import UIElement from '@adyen/adyen-web/dist/types/components/UIElement';
// @ts-ignore
import AdyenCheckoutError from '@adyen/adyen-web/dist/types/core/Errors/AdyenCheckoutError';
// @ts-ignore
import {OnPaymentCompletedData} from '@adyen/adyen-web/dist/types/components/types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ContextService} from '~/app/core/context/context.service';


@Component({
  selector: 'app-adyen',
  imports: [
    AsyncPipe,
    ProgressSpinner
  ],
  templateUrl: './adyen.component.html',
  styleUrls: ['./adyen.component.css']
})
export class AdyenComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private contextService = inject(ContextService);
  private adyenService = inject(AdyenService);
  private syncService = inject(SyncService);
  private destroyRef = inject(DestroyRef);

  readonly containerId = 'adyen-container';
  private dropin: DropinElement | undefined;

  private orderPayment$ = this.orderService.getPayment(this.adyenService.adapterId)
    .pipe(
      shareReplay(1),
    );

  private adyenPayment$ = this.contextService.context$
    .pipe(
      combineLatestWith(this.orderPayment$),
      switchMap(([ctx, payment]) => {
        return this.adyenService.getPayment(ctx.orderId, payment.id!)
      }),
      shareReplay(1),
    );

  coreOptions$ = this.adyenPayment$.pipe(
    filter(config => typeof config !== 'undefined'),
    map(config => {
      return {
        environment: 'test',
        showPayButton: true,
        ...config,
        onSubmit: this.handleOnSubmit.bind(this),
        onError: this.handleOnError.bind(this),
        onAdditionalDetails: this.handleOnAdditionalDetails.bind(this),
        onPaymentCompleted: this.handleOnPaymentCompleted.bind(this),
      } satisfies CoreOptions
    })
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
    this.coreOptions$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(async (options) => {
      if (this.dropin) {
        this.dropin.unmount();
      }
      const instance = await AdyenCheckout(options);
      this.dropin = instance.create('dropin');
      this.dropin.mount(`#${this.containerId}`);
    })
  }

  ngOnDestroy(): void {
    if (this.dropin) {
      this.dropin.unmount()
    }
  }

  private suspend() {
    if (!this.dropin) return;
    this.dropin.setStatus('loading');
  }

  private resume() {
    if (!this.dropin) return;
    this.dropin.setStatus('ready');
  }

  private handleOnSubmit(state: any, element: UIElement) {
    return this.contextService.context$.pipe(
      combineLatestWith(this.orderPayment$),
      take(1),
      switchMap(([ctx, payment]) => {
        return this.adyenService.startTransaction(ctx.orderId, payment.id!, state.data)
      }),
      finalize(() => this.resume())
    ).subscribe((response) => {
      if (typeof response?.action?.actualInstance !== 'undefined') {
        return this.dropin.handleAction(response.action.actualInstance);
      }

      if (response.resultCode) {
        return this.handleResultCode(response.resultCode);
      }
    })
  };

  private handleOnError(error: AdyenCheckoutError, element?: UIElement) {
    return this.contextService.context$.pipe(
      combineLatestWith(this.orderPayment$),
      take(1),
      switchMap(([ctx, payment]) => {
        return this.adyenService.submitDetails(ctx.orderId, payment.id!, error.data)
      }),
      finalize(() => this.resume())
    ).subscribe((response) => {
      if (response.resultCode) {
        return this.handleOnPaymentCompleted();
      }
      return;
    })
  }

  private handleOnAdditionalDetails(state: any, element?: UIElement) {
    return this.contextService.context$.pipe(
      combineLatestWith(this.orderPayment$),
      take(1),
      switchMap(([ctx, payment]) => {
        return this.adyenService.submitDetails(ctx.orderId, payment.id!, state.data);
      }),
      finalize(() => this.resume())
    ).subscribe((response) => {
      if (response.resultCode) {
        return this.handleOnPaymentCompleted();
      }
      return;
    })
  }

  private async handleOnPaymentCompleted(data?: OnPaymentCompletedData, element?: UIElement) {
    if (this.dropin) {
      this.dropin.unmount();
    }
    this.syncService.triggerRefresh();
  }

  // Handle the different status codes here, this just assumes ok
  // https://docs.adyen.com/online-payments/build-your-integration/payment-result-codes/
  private handleResultCode(resultCode: string) {
    return this.handleOnPaymentCompleted();
  }
}
