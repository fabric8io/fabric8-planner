import { MockBackend } from '@angular/http/testing';
import {
  Inject,
  Injectable,
  ReflectiveInjector,
  forwardRef
} from '@angular/core';
import {
  Http,
  XHRBackend,
  RequestOptions,
  Request,
  RequestOptionsArgs,
  Response,
  Headers
} from '@angular/http';
import { AuthenticationService } from 'ngx-login-client';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class HttpService extends Http {

  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(backend: any,
              options: RequestOptions,
              auth: AuthenticationService) {
    super(backend, options);
    if (auth && auth.getToken() != null) {
      options.headers.set('Authorization', `Bearer ${auth.getToken()}`);
    }
  }

  get(url: string, options?: RequestOptionsArgs) {
    console.log('GET request initiated');
    console.log('URL - ', url);
    console.log('Options - ', options);

    return super.get(url, options);
  }

  post(url: string, body: any, options?: RequestOptionsArgs) {
    console.log('POST request initiated');
    console.log('URL - ', url);
    console.log('Body - ', body);
    console.log('Options - ', options);

    return super.post(url, body, options);
  }

  put(url: string, body: any, options?: RequestOptionsArgs) {
    console.log('PUT request initiated');
    console.log('URL - ', url);
    console.log('Body - ', body);
    console.log('Options - ', options);

    return super.put(url, body, options);
  }

  patch(url: string, body: any, options?: RequestOptionsArgs) {
    console.log('PATCH request initiated');
    console.log('URL - ', url);
    console.log('Body - ', body);
    console.log('Options - ', options);

    return super.patch(url, body, options);
  }

}
