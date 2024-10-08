import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NbAuthService } from '@nebular/auth';
import { RoleManagerService } from '../role-manager.service';
import { forkJoin, map, merge, of, tap } from 'rxjs';
import { ToastrMessages } from '../../shared/Infrastructure/Constants/toastr-messages';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: NbAuthService, private router: Router, private roleService: RoleManagerService) {
    }

    canActivate() {
        return forkJoin([this.isAuthenticated(), this.isAuthorized()])
            .pipe(map(([authenticated, authorized]) => {
                return authenticated && authorized;
            }))
    }

    isAuthenticated() {
        return this.authService.isAuthenticated()
            .pipe(
                tap(authenticated => {
                    if (!authenticated) {
                        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
                    }
                }),
            )
    }

    isAuthorized() {
        return this.roleService.isAuthorized()
            .pipe(
                tap(authorized => {
                    if (!authorized) {
                        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
                        alert(ToastrMessages.unauthorized);
                    }
                }),
            )
    }
}