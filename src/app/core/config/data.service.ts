import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from 'rxjs';
import {Configuration} from '~/openapi/configuration';
import {Context} from '~/app/core/entities/Context';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `/proxy/configuration/api/v1/configuration`;
  private client = inject(HttpClient);

  getConfig(ctx: Context, configurationName: string): Observable<Configuration> {
    return this.client.get<Configuration>(
      `${this.baseUrl}/merchants/${ctx.merchant}/channels/${ctx.channel}/configurations/${configurationName}`
    );
  }
}
