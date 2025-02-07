import {Component, inject} from '@angular/core';
import {PAYMENT_SERVICES} from '~/app/checkout/payments/provide-payment-services';
import {ConfigService} from '~/app/core/config/config.service';
import {combineLatestWith, distinctUntilChanged, filter, map, Observable, shareReplay, switchMap, take} from 'rxjs';
import {OrderService} from '~/app/core/order/order.service';
import {PaymentAdapter, PaymentAdapters} from '~/app/core/adapter';
import {PaymentAdapterService} from '~/app/checkout/payments/payment.service.interface';
import {AsyncPipe} from '@angular/common';
import {SelectButton} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {ToastService} from '~/app/core/toast/toast.service';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-payment-selector',
  imports: [
    AsyncPipe,
    SelectButton,
    FormsModule,
    Card
  ],
  templateUrl: './payment-selector.component.html',
})
export class PaymentSelectorComponent {
  private paymentServices = inject(PAYMENT_SERVICES)
  private configService = inject(ConfigService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  enabledPaymentAdapters$: Observable<PaymentAdapter[]> = this.configService.getConfigs().pipe(
    map(configs => {
      return configs
        .filter(config => {
          const isActive = config['active'] === true;
          const isPayment = PaymentAdapters.includes(config.id as PaymentAdapter);
          const hasPaymentService = this.paymentServices.some(service => service.adapterId === config.id)
          if (isPayment && !hasPaymentService) {
            this.toastService.warn(`Payment service for ${config.id} is not available`);
          }
          return isActive && isPayment && hasPaymentService;
        })
        .map(config => config.id as PaymentAdapter)
    }),
    shareReplay(1)
  );

  selectedPaymentAdapter$ = this.orderService.defaultPayment$.pipe(
    map(payment => payment?.adapterId || ''),
    distinctUntilChanged(),
  );

  constructor() {
    this.orderService.hasDefaultPayment$.pipe(
      filter(hasDefaultPayment => !hasDefaultPayment),
      take(1),
      switchMap(() => {
        return this.enabledPaymentAdapters$.pipe(
          take(1),
          map(adapters => adapters[0]),
          switchMap(adapter => {
            const paymentService = this.paymentServices.find(service => service.adapterId === adapter)!;
            return this.createPaymentUsingService(paymentService);
          })
        )
      })
    ).subscribe()
  }

  private createPaymentUsingService(paymentSerice: PaymentAdapterService) {
    return this.orderService.order$.pipe(
      map(order => order.id),
      switchMap(orderId => paymentSerice.createPayment(orderId!))
    )
  }

  private removePaymentUsingService(paymentSerice: PaymentAdapterService) {
    return this.orderService.order$.pipe(
      map(order => order.id),
      combineLatestWith(this.orderService.defaultPayment$),
      switchMap(([orderId, payment]) => paymentSerice.removePayment(orderId!, payment.id!))
    )
  }

  createPaymentByAdapterId(paymentId: string) {
    // replace the current payment (if it exists) with a new payment
    // created by the payment service that corresponds to the given paymentId
    const paymentService = this.paymentServices.find(service => service.adapterId === paymentId)!;
    this.orderService.hasDefaultPayment$.pipe(
      switchMap(hasDefaultPayment => {
        if (hasDefaultPayment) {
          return this.removePaymentUsingService(paymentService).pipe(
            switchMap(() => this.createPaymentUsingService(paymentService)
            ));
        } else {
          return this.createPaymentUsingService(paymentService);
        }
      }),
      take(1),
    ).subscribe()
  }
}
