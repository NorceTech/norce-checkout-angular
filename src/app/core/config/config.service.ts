import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, retry } from 'rxjs';
import { ContextService } from '~/app/core/context/context.service';
import { DataService } from '~/app/core/config/data.service';
import { ToastService } from '~/app/core/toast/toast.service';
import { derivedAsync } from 'ngxtension/derived-async';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private dataService = inject(DataService);
  private contextService = inject(ContextService);
  private toastService = inject(ToastService);

  configs = derivedAsync(() => {
    const context = this.contextService.context();
    if (!context) return EMPTY;
    return this.dataService.getConfigs(context).pipe(
      retry(2),
      catchError(() => {
        this.toastService.error(`Failed to fetch configurations`);
        return EMPTY;
      }),
    );
  });
}
