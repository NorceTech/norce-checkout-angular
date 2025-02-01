import {inject, Injectable} from '@angular/core';
import {catchError, EMPTY, Observable, retry, switchMap} from 'rxjs';
import {Configuration} from '~/openapi/configuration';
import {ContextService} from '~/app/core/context/context.service';
import {DataService} from '~/app/core/config/data.service';
import {ToastService} from '~/app/core/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private dataService = inject(DataService);
  private contextService = inject(ContextService);
  private toastService = inject(ToastService);

  getConfig(configurationName: string): Observable<Configuration> {
    return this.contextService.$context.pipe(
      switchMap(ctx => {
        return this.dataService.getConfig(ctx, configurationName).pipe(
          retry(2),
          catchError(() => {
            this.toastService.error(`Failed to fetch configuration for ${configurationName}`);
            return EMPTY;
          })
        )
      })
    )
  }
}
