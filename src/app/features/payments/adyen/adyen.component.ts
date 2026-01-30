import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { AdyenService } from '~/app/features/payments/adyen/adyen.service';
import { OrderService } from '~/app/core/order/order.service';
import { SyncService } from '~/app/core/sync/sync.service';
import { filter, finalize, map } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import AdyenCheckout from '@adyen/adyen-web';
// @ts-ignore
import type DropinElement from '@adyen/adyen-web/dist/types/components/Dropin';
// @ts-ignore
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
// @ts-ignore
import UIElement from '@adyen/adyen-web/dist/types/components/UIElement';
// @ts-ignore
import AdyenCheckoutError from '@adyen/adyen-web/dist/types/core/Errors/AdyenCheckoutError';
// @ts-ignore
import { OnPaymentCompletedData } from '@adyen/adyen-web/dist/types/components/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { derivedAsync } from 'ngxtension/derived-async';

@Component({
  selector: 'app-adyen',
  imports: [ProgressSpinner],
  templateUrl: './adyen.component.html',
  styleUrls: ['./adyen.component.css'],
})
export class AdyenComponent implements OnDestroy {
  private orderService = inject(OrderService);
  private adyenService = inject(AdyenService);
  private syncService = inject(SyncService);

  readonly containerId = 'adyen-container';
  private dropin: DropinElement | undefined;

  private payment = computed(() => {
    return this.orderService
      .order()
      .payments?.filter((payment) => payment.state !== 'removed')
      .find((payment) => payment.adapterId === this.adyenService.adapterId);
  });
  private paymentId = computed(() => this.payment()?.id);

  coreOptions = derivedAsync(() => {
    const payment = this.payment();
    if (typeof payment?.id === 'undefined') return;

    return this.adyenService.getPayment(payment.id).pipe(
      filter((config) => typeof config !== 'undefined'),
      map((config) => {
        return {
          environment: 'test',
          showPayButton: true,
          amount: payment?.amount,
          ...config,
          onSubmit: this.handleOnSubmit.bind(this),
          onError: this.handleOnError.bind(this),
          onAdditionalDetails: this.handleOnAdditionalDetails.bind(this),
          onPaymentCompleted: this.handleOnPaymentCompleted.bind(this),
        } satisfies CoreOptions;
      }),
    );
  });

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

    // Reload widget to reflect changes in payment (e.g. amount)
    effect(async () => {
      const coreOptions = this.coreOptions();
      if (typeof coreOptions === 'undefined') return;

      if (this.dropin) {
        this.dropin.unmount();
      }
      const instance = await AdyenCheckout(coreOptions);
      this.dropin = instance.create('dropin');
      this.dropin.mount(`#${this.containerId}`);
    });
  }

  ngOnDestroy(): void {
    if (this.dropin) {
      this.dropin.unmount();
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
    return this.adyenService
      .startTransaction(this.paymentId()!, state.data)
      .pipe(finalize(() => this.resume()))
      .subscribe((response) => {
        if (typeof response?.action?.actualInstance !== 'undefined') {
          return this.dropin.handleAction(response.action.actualInstance);
        }

        if (response.resultCode) {
          return this.handleResultCode(response.resultCode);
        }
      });
  }

  private handleOnError(error: AdyenCheckoutError, element?: UIElement) {
    return this.adyenService
      .submitDetails(this.paymentId()!, error.data)
      .pipe(finalize(() => this.resume()))
      .subscribe((response) => {
        if (response.resultCode) {
          return this.handleOnPaymentCompleted();
        }
        return;
      });
  }

  private handleOnAdditionalDetails(state: any, element?: UIElement) {
    return this.adyenService
      .submitDetails(this.paymentId()!, state.data)
      .pipe(finalize(() => this.resume()))
      .subscribe((response) => {
        if (response.resultCode) {
          return this.handleOnPaymentCompleted();
        }
        return;
      });
  }

  private async handleOnPaymentCompleted(
    data?: OnPaymentCompletedData,
    element?: UIElement,
  ) {
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
