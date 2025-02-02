import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {ContextService} from '~/app/core/context/context.service';
import {switchMap} from 'rxjs';

export const contextInterceptor: HttpInterceptorFn = (req, next) => {
  const contextService = inject(ContextService);
  return contextService.context$.pipe(
    switchMap(context => {
      const reqWithContext = req.clone({
        setHeaders: {
          'x-merchant': context.merchant,
          'x-channel': context.channel,
        }
      });
      return next(reqWithContext);
    })
  )
};
