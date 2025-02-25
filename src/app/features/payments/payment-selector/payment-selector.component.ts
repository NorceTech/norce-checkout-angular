import {Component, computed, inject, signal, untracked} from '@angular/core';
import {EMPTY, Subject, switchMap} from 'rxjs';
import {SelectButton} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {ToastService} from '~/app/core/toast/toast.service';
import {Card} from 'primeng/card';
import {PAYMENT_SERVICES} from '~/app/features/payments/provide-payment-services';
import {ConfigService} from '~/app/core/config/config.service';
import {OrderService} from '~/app/core/order/order.service';
import {SyncService} from '~/app/core/sync/sync.service';
import {ADAPTERS} from '~/app/core/adapter';
import {Payment} from '~/openapi/order';
import {connect} from 'ngxtension/connect';
import {effectOnceIf} from 'ngxtension/effect-once-if';

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

  usePaymentAdapter$ = new Subject<string>()

  private state = signal({
    currentPayment: null as Payment | null,
    enabledPayments: null as string[] | null,
  })
  currentPayment = computed(() => this.state().currentPayment);
  enabledPayments = computed(() => this.state().enabledPayments);

  constructor() {
    connect(this.state)
      .with(() => {
        const state = untracked(() => this.state());
        const configs = this.configService.configs();
        if (!configs) return untracked(() => state);

        const enabledPayments = configs
          .filter(config => {
            const isActive = config['active'] === true;
            const isPayment = this.paymentAdapters.includes(config.id);
            const hasPaymentService = this.paymentServices.some(service => service.adapterId === config.id)
            if (isPayment && !hasPaymentService) {
              this.toastService.warn(`Payment service for ${config.id} is not available`);
            }
            return isActive && isPayment && hasPaymentService;
          })
          .map(config => config.id);

        return {
          ...state,
          enabledPayments: enabledPayments
        }
      })
      .with(() => {
        const state = untracked(() => this.state());
        const payment = this.orderService.order()
          ?.payments
          ?.filter(payment => payment.type === 'default')
          ?.find(payment => payment.state !== 'removed')

        if (!payment) return state;

        return {
          ...state,
          currentPayment: payment,
        }
      })

    this.usePaymentAdapter$.pipe(
      switchMap(adapterId => {
        const enabledPayments = this.state().enabledPayments;
        if (!enabledPayments) return EMPTY;
        if (!enabledPayments.includes(adapterId)) {
          this.toastService.error(`Payment service for ${adapterId} is not available`);
          return EMPTY;
        }

        const currentPayment = this.currentPayment();
        const currentPaymentService = this.paymentServices.find(service => service.adapterId === currentPayment?.adapterId);
        const nextPaymentService = this.paymentServices.find(service => service.adapterId === adapterId)!;
        if (currentPaymentService) {
          return currentPaymentService.removePayment(currentPayment!.id!).pipe(
            switchMap(() => nextPaymentService.createPayment())
          )
        } else {
          return nextPaymentService.createPayment();
        }
      }),
    ).subscribe(() => this.syncService.triggerRefresh())

    effectOnceIf(
      () => !this.currentPayment() && this.enabledPayments()?.length! > 0,
      () => {
        const adapterId = this.enabledPayments()![0];
        this.usePaymentAdapter$.next(adapterId);
      })
  }
}
