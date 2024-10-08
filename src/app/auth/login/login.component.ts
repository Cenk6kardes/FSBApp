import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule } from '@nebular/theme';
import { Subject, takeUntil } from 'rxjs';
import { NbAuthService, NbAuthToken, NbAuthResult } from '@nebular/auth';
import { AuthAzureToken } from '../azure/azure-adb2c-auth-strategy';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  template: `
      <nb-card>
        <nb-card-body>
          <p>Signing in...</p>
        </nb-card-body>
      </nb-card>
`,
})
export class LoginComponent implements OnInit, OnDestroy {
  token: AuthAzureToken;

  private destroy$ = new Subject<void>();

  constructor(private authService: NbAuthService, private router: Router) {
    this.authService
      .onTokenChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe((token: NbAuthToken) => {
        if (token && token.isValid()) {
          this.token = token as AuthAzureToken;
        }
      });
  }
  ngOnInit(): void {
    this.login();
  }

  login() {
    this.authService
      .authenticate('azure')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => { });
  }

  logout() {
    this.authService
      .logout('azure')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}