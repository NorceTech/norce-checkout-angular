import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {ContextService} from '~/app/core/context/context.service';

export const contextInterceptor: HttpInterceptorFn = (req, next) => {
  const contextService = inject(ContextService);
  const context = contextService.context();

  if (!context) {
    return next(req);
  }

  const reqWithContext = req.clone({
    setHeaders: {
      'x-merchant': context.merchant,
      'x-channel': context.channel,
    }
  });
  return next(reqWithContext);
};
