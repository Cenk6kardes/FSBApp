import { Component, OnInit, OnDestroy, Input, AfterViewInit } from '@angular/core';
import { NbTrigger } from '@nebular/theme';
import { RoleManagerService } from 'src/app/auth/role-manager.service';
import { Subject, takeUntil } from 'rxjs';
import { NbAuthResult, NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

// const usersDemo = [
//   {
//     'name': 'Elizabeth Gurr',
//     'title': RoleConstants.roleNames.globalAdmin
//   },
//   {
//     'name': 'Faina Rolstone',
//     'title': RoleConstants.roleNames.sysAdmin
//   },
//   {
//     'name': 'Erwin Doubrava',
//     'title': RoleConstants.roleNames.reviewer
//   },
//   {
//     'name': 'John Doe',
//     'title': RoleConstants.roleNames.preparer
//   },
// ];
//DELETE

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  private readonly unSubscribe$ = new Subject<void>();
  public trigger = NbTrigger.CLICK;
  userName: string;
  userRole: string;
  public userTitle: string;
  constructor(private roleService: RoleManagerService,
    private authService: NbAuthService,
    private router: Router) { }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  ngOnInit(): void {
    this.setUserInfo();
  }

  userLogout() {
    this.authService
      .logout('azure')
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((authResult: NbAuthResult) => {
        // this.router.navigate(['/auth/login']);
        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
      });
  }

  setUserInfo() {
    const user = this.roleService.getAuthLocalStorage();
    if(user){
      this.userName = user.name;
      this.userRole = user.role;
    }
  }
  setUserDemo(role: string) {//DELETE
    this.roleService.setRoleDemo(role)
  }
}
