import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthService, NbAuthResult } from '@nebular/auth';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrMessages } from './shared/Infrastructure/Constants/toastr-messages';
@Component({
  selector: 'app-root',
  template: `
    <nb-layout class="layout-fix">
      <nb-layout-column class="layout-fix">
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>`,
  styles: ['.layout-fix {  padding: 0 !important; }']
})
export class AppComponent implements OnDestroy {
  title = 'FSBApp.';
  private destroy$ = new Subject<void>();
  userInactive: Subject<any> = new Subject();
  timeoutId;

  constructor(private authService: NbAuthService, private router: Router) {
    this.checkTimeOut();
    this.userInactive
      .pipe(takeUntil(this.destroy$))
      .subscribe(inactive => {
        if (inactive) {
          this.logout();
        }
      })
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown')
  @HostListener('window:scroll', ['$event'])
  @HostListener('window:mousedown')
  checkUserActivity() {
    clearTimeout(this.timeoutId);
    this.checkTimeOut();
  }

  checkTimeOut() {
    this.timeoutId = setTimeout(() => {
      this.userInactive.next(true);
    }, 3540000); // 3540000: 59 minutes
  }

  logout() {
    this.authService
      .logout('azure')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        // this.router.navigate(['/auth/login']);
        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
        alert(ToastrMessages.authExpired)
      });
  }
}