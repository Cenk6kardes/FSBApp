import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material/material.module';
import { NbThemeModule, NbSidebarModule, NbMenuModule, NbDatepickerModule, NbLayoutModule, NbTimepickerModule, NbCardModule, NbButtonModule, NbToastrModule } from '@nebular/theme';
import { CoreModule } from './@core/core.module';
import { HomesModule } from './@modules/home.module';
import { HandleResponseInterceptor } from './interceptors/handle-response.interceptor';
import { HeadersInterceptor } from './interceptors/headers.interceptor';
import { NbRoleProvider, NbSecurityModule } from '@nebular/security';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { RoleProvider } from './auth/role.provider';

import { NbAuthModule } from '@nebular/auth';
import { AuthAzureToken, AzureADB2CAuthStrategy } from './auth/azure/azure-adb2c-auth-strategy';
// import { environment } from '../environments/environment.prod';
// import { environment as devEenvironment} from '../environments/environment';
import { environment } from '../environments/environment';
import { AuthGuard } from './auth/azure/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { CallbackComponent } from './auth/azure/auth-callback.component';
import { RoleManagerService } from './auth/role-manager.service';



@NgModule({
  declarations: [AppComponent, LoginComponent, CallbackComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    HomesModule,
    NbCardModule,
    NbButtonModule,
    CoreModule.forRoot(),
    NbThemeModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbTimepickerModule.forRoot(),
    NbSecurityModule.forRoot(),
    NgxDaterangepickerMd.forRoot(),
    NbToastrModule.forRoot(),
    NbLayoutModule,
    NbAuthModule.forRoot({
      strategies: [
        AzureADB2CAuthStrategy.setup({
          name: 'azure',
          clientId: environment.AD_CONFIG.clientId,
          clientSecret: environment.AD_CONFIG.clientSecret,
          authorize: {
            endpoint: environment.AD_CONFIG.authorize.endpoint,
            responseType: environment.AD_CONFIG.authorize.responseType,
            scope: environment.AD_CONFIG.authorize.scope,
            redirectUri: environment.AD_CONFIG.authorize.redirectUri,
            // redirectUri: 'http://localhost:4200/auth/callback',
            params: {
              nonce: AuthAzureToken.generate_nonce(5),
            },
          },
          token: {
            class: AuthAzureToken,
          },
          redirect: {
            success: '/home/dashboard',
          },
        }),
      ],
      forms: {},
    }),
  ],
  providers: [
    AzureADB2CAuthStrategy,
    AuthGuard,
    RoleManagerService,
    {
      provide: NbRoleProvider, useClass: RoleProvider
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HandleResponseInterceptor,
      multi: true,
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: NbAuthJWTInterceptor,
    //   multi: true,
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeadersInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  isProd: boolean = environment.production;
}
