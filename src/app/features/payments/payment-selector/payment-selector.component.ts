import {Component, computed, inject} from '@angular/core';
import {PAYMENT_SERVICES} from '~/app/features/payments/provide-payment-services';
import {ConfigService} from '~/app/core/config/config.service';
import {EMPTY, filter, finalize, map, switchMap, take} from 'rxjs';
import {OrderService} from '~/app/core/order/order.service';
import {SelectButton} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {ToastService} from '~/app/core/toast/toast.service';
import {Card} from 'primeng/card';
import {SyncService} from '~/app/core/sync/sync.service';
import {ADAPTERS} from '~/app/core/adapter';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-payment-selector',
  imports: [
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

  selectedPayment = computed(() => {
    return this.orderService.order()
      .payments
      ?.filter(payment => payment.type === 'default')
      ?.find(payment => payment.state !== 'removed')
  });

  private hasPayment$ = toObservable(this.selectedPayment).pipe(
    map(selectedPayment => !!selectedPayment),
  );

  constructor() {
    this.hasPayment$.pipe(
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

  createOrReplacePaymentByAdapterId(adapterId: string) {
    const currentPaymentService = this.paymentServices.find(service => service.adapterId === this.selectedPayment()?.adapterId);
    const nextPaymentService = this.paymentServices.find(service => service.adapterId === adapterId)!;
    this.hasPayment$.pipe(
      take(1),
      switchMap(hasPayment => {
        if (hasPayment) {
          if (!currentPaymentService) return EMPTY;
          return currentPaymentService.removePayment(this.selectedPayment()?.id!).pipe(
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
