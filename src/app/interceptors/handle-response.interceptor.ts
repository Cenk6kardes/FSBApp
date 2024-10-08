import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpEventType,
  HttpErrorResponse,
} from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { GenericResponse } from '../@core/models/shared/response.model';
import { Router } from '@angular/router';
import { ToastrMessages } from '../shared/Infrastructure/Constants/toastr-messages';
import { environment } from 'src/environments/environment';

@Injectable()
export class HandleResponseInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(map(event => {
      if (event.type === HttpEventType.Response) {
        if (event.status === HttpStatusCode.Unauthorized) {
          window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
          return event;
        }

        if (event.status === HttpStatusCode.Ok) {
          let response: any = event.body as GenericResponse<any>;
          if (!response.length) { // Object response as GenericResponse (if is not a list)
            if (response.httpStatusCode === HttpStatusCode.Ok || response.httpStatusCode === HttpStatusCode.Created)
              return event.clone({ body: event.body.response })
            else {
              throw new HttpErrorResponse({
                status: event.body.httpStatusCode,
                error: event.body.message,
                url: event.url!,
                headers: event.headers
              })
            }
          } else { // Object response as List of GenericResponse( Eg. List of Users to create)
            response = event.body as GenericResponse<any>[];
            const listResponse: any = [];
            response.forEach(element => {
              let resp: any = element.response;
              if (element.httpStatusCode !== HttpStatusCode.Ok) resp = element.message;
              listResponse.push({ response: resp, status: element.httpStatusCode })
            });

            return event.clone({ body: listResponse })
          }
        }
      }
      return event;
    }));
  }
}
