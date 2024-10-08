import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { CallbackComponent } from './auth/azure/auth-callback.component';
import { AuthGuard } from './auth/azure/auth-guard.service';

const routes: Routes = [ 
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/callback',
    component: CallbackComponent,
  },
  {
    path:'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('../app/@modules/home.module').then(x=>x.HomesModule)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];

const config: ExtraOptions = {
  useHash: false,
};
@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// export const routingComponent = [EngagementComponent, CoaComponent]