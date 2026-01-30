import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '~/environments/environment';
import { PlatformService } from '~/app/core/platform/platform.service';
import { SyncService } from '~/app/core/sync/sync.service';

@Component({
  selector: 'app-create-order',
  imports: [FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './create-order.component.html',
})
export class CreateOrderComponent {
  private fb = inject(NonNullableFormBuilder);
  private platformAdapterService = inject(PlatformService);
  private syncService = inject(SyncService);
  private router = inject(Router);

  readonly hasInFlightRequest$ = this.syncService.hasInFlightRequest$;

  readonly form = this.fb.group({
    basketId: ['', Validators.required],
    merchant: [environment.context.merchant ?? '', Validators.required],
    channel: [environment.context.channel ?? '', Validators.required],
    culture: ['sv-SE', Validators.required],
  });

  submit(): void {
    if (this.form.valid) {
      const { basketId, merchant, channel, culture } = this.form.getRawValue();
      this.platformAdapterService
        .createOrder({
          merchant,
          channel,
          cartReference: basketId,
          culture,
        })
        .subscribe((context) => {
          this.router.navigate(['/checkout'], {
            queryParams: {
              merchant: context.merchant,
              channel: context.channel,
              orderId: context.orderId,
            },
          });
        });
    }
  }
}
