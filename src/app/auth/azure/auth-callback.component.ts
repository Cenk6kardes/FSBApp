import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthService, NbAuthResult, NbAuthToken } from '@nebular/auth';
import { Subject, takeUntil, Observable, tap } from 'rxjs';
import { RoleManagerService } from '../role-manager.service';
import { UserClaims } from 'src/app/@core/models/user/user-claims';
import { FSBConstants } from 'src/app/shared/Infrastructure/constants/constants';
import { ToastrService } from '../../@core/services/shared/toastr/toastr.service';
import { ToastrMessages } from '../../shared/Infrastructure/Constants/toastr-messages';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/@core/services/shared/http/http.service';

@Component({
  selector: 'app-callback',
  template: `
    <p>Authenticating...</p>
`,
})
export class CallbackComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private authService: NbAuthService,
    private router: Router,
    private _toastr: ToastrService,
    private roleService: RoleManagerService,
    private http: HttpService) {
    this.authService.authenticate('azure')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        if (authResult.isSuccess() && authResult.getRedirect()) {
          this.validateFsbAuthzn()
            .subscribe(claims => {
              if (claims.roleId === FSBConstants.emptyGuid || claims.userId === FSBConstants.emptyGuid) {
                this.logout();
              }
              this.roleService.saveAuthLocalStorage({...claims, token:authResult.getToken().getValue() });
              this.router.navigateByUrl(authResult.getRedirect());
            });
        } else {
          this.router.navigateByUrl('auth/login');
        }
      });
  }

  getUserInfo(): Observable<UserClaims> {
    return this.http.get(`${FSBConstants.uriGetFSBToken}`);
  }

  validateFsbAuthzn(): Observable<UserClaims> {
    return this.getUserInfo()
      .pipe(
        tap({
          error: () => {
            this.logout();
          }
        })
      );
  }

  logout() {
    this.authService
      .logout('azure')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        // this.router.navigate(['/auth/login']);
        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
        alert(ToastrMessages.unauthorized);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
