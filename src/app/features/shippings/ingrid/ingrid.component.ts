import {Component, computed, inject} from '@angular/core';
import {OrderService} from '~/app/core/order/order.service';
import {DomSanitizer} from '@angular/platform-browser';
import {SyncService} from '~/app/core/sync/sync.service';
import {bindCallback, catchError, EMPTY, finalize, retry, switchMap} from 'rxjs';
import {IngridService} from '~/app/features/shippings/ingrid/ingrid.service';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RunScriptsDirective} from '~/app/shared/directives/run-scripts.directive';
import {IngridApi, IngridEventName, WindowIngrid} from '~/app/features/shippings/ingrid/ingrid.types';
import {ToastService} from '~/app/core/toast/toast.service';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {derivedAsync} from 'ngxtension/derived-async';

@Component({
  selector: 'app-ingrid',
  imports: [
    ProgressSpinner,
    RunScriptsDirective
  ],
  templateUrl: './ingrid.component.html',
})
export class IngridComponent {
  private ingridService = inject(IngridService);
  private orderService = inject(OrderService);
  private domSanitizer = inject(DomSanitizer);
  private syncService = inject(SyncService);
  private toastService = inject(ToastService);

  snippetTargetId = "ingrid-target";

  private shippingId = computed(() => {
    return this.orderService.order().shippings
      ?.filter(s => s.state !== 'removed')
      .find(s => s.adapterId === this.ingridService.adapterId)?.id;
  })

  private ingridsession = derivedAsync(() => {
    const shippingId = this.shippingId();
    if (typeof shippingId === 'undefined') return;
    return this.ingridService.getShipping(shippingId)
  })
  html = computed(() => {
    const html = this.ingridsession()?.htmlSnippet;
    if (typeof html === 'undefined') return;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  })
  useAddressForm = computed(() => this.ingridsession()?.useAddressForm)

  constructor() {
    this.syncService.hasInFlightRequest$.pipe(takeUntilDestroyed())
      .subscribe(hasInFlightRequest => {
        if (hasInFlightRequest) {
          this.suspend();
        } else {
          this.resume();
        }
      })

    toObservable(this.html).pipe(
      switchMap(() => bindCallback(this.addEventListeners.bind(this)).call(undefined)),
      retry({
        count: 10,
        delay: 100
      }),
      catchError((error) => {
        this.toastService.error('Failed to add ingrid event listeners');
        return EMPTY;
      })
    ).subscribe()
  }

  private suspend() {
    const _sw = (window as WindowIngrid)._sw;
    if (typeof _sw === "undefined") return;
    _sw((api: IngridApi) => {
      api.suspend();
    })
  }

  private resume() {
    const _sw = (window as WindowIngrid)._sw;
    if (typeof _sw === "undefined") return;
    _sw((api: IngridApi) => {
      api.resume();
    })
  }

  private addEventListeners() {
    const _sw = (window as WindowIngrid)._sw;
    if (typeof _sw === "undefined") {
      throw new Error('Ingrid API not found');
    }
    _sw((api: IngridApi) => {
      if (this.useAddressForm()) {
        api.on(IngridEventName.SummaryChanged, (data, meta) => {
          if (meta?.total_value_changed) {
            this.ingridService.updateShipping(this.shippingId()!).pipe(
              finalize(() => this.syncService.triggerRefresh())
            ).subscribe()
          }
          if (meta?.delivery_address_changed || meta?.delivery_address_changed) {
            this.ingridService.updateCustomer(this.shippingId()!).pipe(
              finalize(() => this.syncService.triggerRefresh())
            ).subscribe()
          }
        });
      } else {
        api.on(IngridEventName.DataChanged, (data, meta) => {
          if (meta?.initial_load) return;
          this.ingridService.updateShipping(this.shippingId()!).pipe(
            finalize(() => this.syncService.triggerRefresh())
          ).subscribe()
        })
      }
    })
  }
}
