import {Component, computed, inject} from '@angular/core';
import {PAYMENT_SERVICES} from '~/app/features/payments/provide-payment-services';
import {ConfigService} from '~/app/core/config/config.service';
import {combineLatestWith, distinctUntilChanged, EMPTY, filter, finalize, map, switchMap, take} from 'rxjs';
import {OrderService} from '~/app/core/order/order.service';
import {IPaymentService} from '~/app/features/payments/payment.service.interface';
import {AsyncPipe} from '@angular/common';
import {SelectButton} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {ToastService} from '~/app/core/toast/toast.service';
import {Card} from 'primeng/card';
import {SyncService} from '~/app/core/sync/sync.service';
import {ADAPTERS} from '~/app/core/adapter';

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
  private syncService = inject(SyncService);
  private adapters = inject(ADAPTERS);

  private paymentAdapters = Object.values(this.adapters.payment || []);

  enabledPaymentAdapters = computed(() => {
    const configs = this.configService.configs();
    if (!configs) return undefined;
    return configs
      .filter(config => {
        const isActive = config['active'] === true;
        const isPayment = this.paymentAdapters.includes(config.id);
        const hasPaymentService = this.paymentServices.some(service => service.adapterId === config.id)
        if (isPayment && !hasPaymentService) {
          this.toastService.warn(`Payment service for ${config.id} is not available`);
        }
        return isActive && isPayment && hasPaymentService;
      })
      .map(config => config.id)
  })

  selectedPaymentAdapter$ = this.orderService.defaultPayment$.pipe(
    map(payment => payment?.adapterId || ''),
    distinctUntilChanged(),
  );

  constructor() {
    this.orderService.hasDefaultPayment$.pipe(
      take(1),
      filter(hasDefaultPayment => !hasDefaultPayment),
      switchMap(() => {
        const adapters = this.enabledPaymentAdapters();
        if (!adapters) return EMPTY;
        
        const adapter = this.enabledPaymentAdapters()?.[0];
        if (!adapter) {
          this.toastService.warn('No payment adapter configured');
          return EMPTY;
        }
        const paymentService = this.paymentServices.find(service => service.adapterId === adapter);
        if (!paymentService) return EMPTY;
        return paymentService.createPayment();
      }),
      finalize(() => this.syncService.triggerRefresh()),
    ).subscribe()
  }

  private removePaymentUsingService(paymentSerice: IPaymentService) {
    return this.orderService.order$.pipe(
      map(order => order.id),
      combineLatestWith(this.orderService.defaultPayment$),
      take(1),
      switchMap(([orderId, payment]) => paymentSerice.removePayment(payment.id!)),
    )
  }

  createOrReplacePaymentByAdapterId(adapterId: string) {
    const currentPaymentService = this.selectedPaymentAdapter$.pipe(
      take(1),
      map(adapterId => this.paymentServices.find(service => service.adapterId === adapterId)!),
    )
    const nextPaymentService = this.paymentServices.find(service => service.adapterId === adapterId)!;
    this.orderService.hasDefaultPayment$.pipe(
      take(1),
      combineLatestWith(currentPaymentService),
      switchMap(([hasDefaultPayment, currentPaymentService]) => {
        if (hasDefaultPayment) {
          return this.removePaymentUsingService(currentPaymentService).pipe(
            switchMap(() => nextPaymentService.createPayment()
            ));
        } else {
          return nextPaymentService.createPayment()
        }
      }),
      finalize(() => this.syncService.triggerRefresh()),
    ).subscribe()
  }
}
