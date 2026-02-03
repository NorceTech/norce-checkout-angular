import {
  afterNextRender,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { OrderService } from '~/app/core/order/order.service';
import { SyncService } from '~/app/core/sync/sync.service';
import {
  bindCallback,
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  Observable,
  of,
  retry,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { NshiftService } from '~/app/features/shippings/nshift/nshift.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import {
  NshiftSettings,
  NshiftWidget,
} from '~/app/features/shippings/nshift/nshift.types';
import { ToastService } from '~/app/core/toast/toast.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  NShiftSession,
  ShippingOption,
  WidgetSettings,
} from '~/openapi/nshift-adapter';
import { connect } from 'ngxtension/connect';
import { filterNil } from 'ngxtension/filter-nil';
import { toObservableSignal } from 'ngxtension/to-observable-signal';
import { RunScriptsDirective } from '~/app/shared/directives/run-scripts.directive';
import { derivedAsync } from 'ngxtension/derived-async';

@Component({
  selector: 'app-nshift',
  imports: [ProgressSpinner],
  templateUrl: './nshift.component.html',
})
export class NshiftComponent implements OnInit {
  private nshiftService = inject(NshiftService);
  private orderService = inject(OrderService);
  private syncService = inject(SyncService);
  private toastService = inject(ToastService);

  readonly targetId = 'nshift-target';
  readonly scriptId = 'nshift-script-target';

  private shippingId = computed(() => {
    return this.orderService
      .order()
      .shippings?.filter((s) => s.state !== 'removed')
      .find((s) => s.adapterId === this.nshiftService.adapterId)?.id;
  });

  private _session = signal<NShiftSession>({});
  session = toObservableSignal(this._session.asReadonly());

  // Create widget when session settings change
  widgetCreated$ = this.session.pipe(
    takeUntilDestroyed(),
    map((session) => session?.settings),
    filterNil(),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    switchMap((widgetSettings) => of(this.createWidget(widgetSettings))),
    retry({
      count: 2,
      delay: 100,
    }),
    filterNil(),
    map(() => undefined), // We can't use instance directly since it can be modified outside of Angular
    catchError((error) => {
      this.toastService.error('Failed to create nshift widget');
      return EMPTY;
    }),
  );

  private selectOption$ = new Subject<string>();

  constructor() {
    const getSession$ = this.nshiftService.getShipping(this.shippingId()!);
    const updatedSelection$ = this.selectOption$.pipe(
      takeUntilDestroyed(),
      distinctUntilChanged(),
      map((id) => ({
        ...this.session(),
        selectedOptionId: id,
      })),
    );
    const refreshSession$ = toObservable(this.orderService.order).pipe(
      takeUntilDestroyed(),
      map((o) => ({
        cart: o.cart,
        customer: o.customer,
      })),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(() => this.nshiftService.getShipping(this.shippingId()!)),
    );

    connect(this._session)
      .with(getSession$)
      .with(updatedSelection$)
      .with(refreshSession$);

    updatedSelection$
      .pipe(
        takeUntilDestroyed(),
        map((session) =>
          session.data?.options?.find(
            (option) => option.optionId === session.selectedOptionId,
          ),
        ),
        filterNil(),
        switchMap((option) =>
          this.nshiftService.updateShipping(this.shippingId()!, option),
        ),
      )
      .subscribe(() => this.syncService.triggerRefresh());

    // Enable/disable widget based on in-flight requests
    this.widgetCreated$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => this.syncService.hasInFlightRequest$),
      )
      .subscribe((inFlight) => {
        const widget = this.getWidget();

        console.log(inFlight, widget);
        if (!widget) return;
        if (inFlight) {
          (window as any).nshift.disable();
        } else {
          (window as any).nshift.enable();
        }
      });

    // Update widget when session data changes
    this.widgetCreated$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => this.session),
        filterNil(),
        map((session) => {
          const data = session?.data;
          const selectedOption = data?.options?.find(
            (option) => option.optionId === session.selectedOptionId,
          );
          return [data, selectedOption] as const;
        }),
        distinctUntilChanged(
          ([a], [b]) => JSON.stringify(a) === JSON.stringify(b),
        ),
      )
      .subscribe(async ([data, selectedOption]) => {
        const widget = this.getWidget();
        if (!widget) return;

        widget.disable();
        widget.updateOptions(data, selectedOption);
        widget.enable();
      });
  }

  ngOnInit(): void {
    if (document.getElementById(this.scriptId)) return;
    const tag = document.createElement('script');
    tag.src =
      'https://www.nshiftportal.com/checkout/widget/nshift-checkout-widget.js';
    tag.id = this.scriptId;
    tag.async = true;
    document.head.appendChild(tag);
  }

  private createWidget(settings: WidgetSettings) {
    const target = document.querySelector(`#${this.targetId}`);
    if (!target) {
      throw new Error('Nshift target element not found');
    }

    const widgetSettings: NshiftSettings = {
      widgetVersion: settings.widgetVersion || '2',
      theme: settings.theme || 'nshift-theme1',
      themeOverride: settings.themeOverride as any,
      mode: settings.mode || 'standard',
      widthBreakpoints: settings.widthBreakpoints as any,
      resultCallback: (result) => {
        const optionId = (result as ShippingOption)?.optionId;
        if (typeof optionId === 'string') {
          this.selectOption$.next(optionId);
        }
      },
    };

    if (!window.nShiftCheckoutWidget) {
      throw new Error('Nshift widget not loaded');
    }

    const widget = window.nShiftCheckoutWidget.createWidget(
      `#${this.targetId}`,
      widgetSettings,
    );
    widget.install();

    (window as any).nshift = widget;
    return widget;
  }

  private getWidget(): NshiftWidget | undefined {
    return (window as any).nshift || undefined;
  }
}
