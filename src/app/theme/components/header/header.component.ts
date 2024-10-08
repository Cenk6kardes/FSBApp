import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NbAuthResult, NbAuthService } from '@nebular/auth';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { filter, map, Subject, takeUntil, tap } from 'rxjs';
import { IWarningWidget } from 'src/app/@core/models/notification/notifications-widgets-model';
import { UserClaims } from 'src/app/@core/models/user/user-claims';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { LayoutService } from 'src/app/@core/services/utils/layout.service';
import { MENU_ITEMS } from 'src/app/@modules/home-menu';
import { RoleManagerService } from 'src/app/auth/role-manager.service';
import { CoaType } from 'src/app/shared/Infrastructure/constants/constants';
import { RoleConstants } from 'src/app/shared/Infrastructure/Constants/role-constants';
import { ToastrMessages } from 'src/app/shared/Infrastructure/Constants/toastr-messages';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public headerTitle?: string;
  public url?: string;
  public urlLength: number;
  public elementName: string;
  public warningBox = {} as IWarningWidget
  private readonly unSubscribe$ = new Subject<void>();
  public warningToastr: boolean
  public userId = '';
  public role = '';
  public userClaims: UserClaims;

  constructor(private menuService: NbMenuService,
    private layoutService: LayoutService,
    private sidebarService: NbSidebarService,
    private router: Router,
    private _notificationService: NotificationsServices,
    private _toastr: ToastrService,
    private _roleService: RoleManagerService,
    private authService: NbAuthService) {
    this.userClaims = {} as UserClaims;
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((navigationEnd) => { return navigationEnd.url })
    )
      .subscribe((title) => {
        let urlItems = title.split('/');
        this.layoutService.routerURL.next(urlItems[2]);
        this.url = `/${urlItems[1]}/${urlItems[2]}`;
        this.urlLength = urlItems.length;
        this.elementName = '';
        if (urlItems.length > 5) {
          if (this.headerTitle?.indexOf('Details')) {
            this.headerTitle = `All ${CoaType[urlItems[6]]} COA list`;
            this.elementName = decodeURI(urlItems[5]);
          }
        }
        else if (urlItems.length === 5) {
          this.headerTitle = MENU_ITEMS.find(val => val.link === this.url)?.title;
        }
        else if (urlItems.length === 3) {
          this.headerTitle = MENU_ITEMS.find(val => val.link === title)?.title;
        }
        else if (urlItems.length === 2) {
          this.headerTitle = MENU_ITEMS[0].title;
        }
      });
  }

  ngOnInit(): void {
    this._roleService._userId.subscribe((user) => {
      this.userId = user;
    })
    this._roleService.userClaims.subscribe((user) => {
      this.userId = user.userId
      this.role = user.role;
    })
    this.lockOut();
    this._notificationService.warningWidget.subscribe(
      (warning) => {
        if (warning?.Message) {
          this.checkIsWarningDismissedUser(this.userId)
          this.warningBox = warning
          this.lockOut();
        } else this.warningToastr = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }


  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  navigateBack() {
    this.elementName = '';
    this.router.navigate([this.url]);
  }

  getWarningDetails(event) {
    this.warningBox = event;
    this.warningToastr = this.warningBox?.Message ? true : false;
  }

  lockOut() {
    this._notificationService.lockOutUser()
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () =>
            this._toastr.showError('An errror ocurrs'),
        })
      )
      .subscribe(lockOut => {
        if (lockOut) this.role !== (RoleConstants.roleNames['Global Admin'] || RoleConstants.roleNames['System Admin']) ?? this.logout();
      })
  }

  dismissWarningForUser(userId: string) {
    this._notificationService.dismissForUser(userId)
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () =>
            this._toastr.showError('An errror ocurrs'),
        })
      )
      .subscribe(dissmiss => {
        if (dissmiss) this.warningToastr = false;
      })
  }

  checkIsWarningDismissedUser(userId: string) {
    this._notificationService.isWarningDissmissed(userId)
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () =>
            this._toastr.showError('An errror ocurrs'),
        })
      )
      .subscribe(dismissed => {
        if (dismissed) this.warningToastr = false;
        else if (!dismissed) { this.warningToastr = true; }
      })
  }

  logout() {
    this.authService
      .logout('azure')
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((authResult: NbAuthResult) => {
        // this.router.navigate(['/auth/login']);
        window.location.href = `https://login.microsoftonline.com/${environment.AD_CONFIG.tenantId}/oauth2/logout?post_logout_redirect_uri=${environment.AD_CONFIG.authorize.redirectUri}`;
        alert(ToastrMessages.unauthorized);
      });
  }
}