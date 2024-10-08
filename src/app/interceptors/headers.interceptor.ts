import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleManagerService } from '../auth/role-manager.service';
import { NbAuthService, NbTokenService } from '@nebular/auth';
import { AuthAzureToken } from '../auth/azure/azure-adb2c-auth-strategy';

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {
  token: string = '';
  userId: string = '';
  constructor(private roleManager: RoleManagerService, private authService: NbTokenService) {  }
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.authService.get().subscribe(id_token => {
      var tokenPayLoad = id_token as AuthAzureToken;
      this.token = tokenPayLoad.getValue();
    })
    this.roleManager._userId.subscribe(id => { if (id) this.userId = id });

    return next.handle(request.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'UserGuid': this.userId,
        'Authorization': `Bearer ${this.token}`
      })
    }));
  }
}
