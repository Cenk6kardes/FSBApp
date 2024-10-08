import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EntityService } from 'src/app/@core/services/entity/entity.service';
import { IEntity } from 'src/app/@core/models/entityScreen/entityScreenModel.interface';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { INotificationList, INotificationsWidgets, ITimeZones, IWarning, IWarningWidget } from 'src/app/@core/models/notification/notifications-widgets-model';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { UserService } from 'src/app/@core/services/user/user.service';
import { IUserModel } from 'src/app/@core/models/user/user-model';
import { RoleManagerService } from 'src/app/auth/role-manager.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  public showNotifications: boolean = false;
  public showNotificationForm: boolean = false;
  public showWarningForm: boolean = false;
  public showBadge: boolean = true;
  public notificationCount: number | null = null;
  public notificationForm: FormGroup
  public warningForm: FormGroup
  collapsableItem: number = -1;
  public entityList$: Observable<IEntity[]>;
  public userList$: Observable<IUserModel[]>;
  public timeZoneList$: Observable<ITimeZones[]>;
  public entityLoading: boolean = true;
  public userLoading: boolean = true;
  public timeZoneLoading: boolean = true;
  public expireType: string = "1"
  @ViewChild("setHour") setHour: ElementRef<any>;
  notification: INotificationsWidgets;
  private readonly unSubscribe$ = new Subject<void>();
  public loading = false;
  public notificationList: INotificationList[] = [];
  public userId = '';
  public updateWarning = {} as IWarning;
  public warningToastr = false;
  public warningToastItems = {} as IWarningWidget;
  public minDate = new Date();
  @Output() checkedWarning = new EventEmitter<{}>();

  constructor(private _entityService: EntityService, private _notificationService: NotificationsServices, private _toastr: ToastrService, private _userService: UserService, private _roleService: RoleManagerService) { }

  ngOnInit(): void {
    this._roleService._userId.subscribe((user) => {
      this.userId = user;
      this.notificationForm?.patchValue({
        sender: user
      })
      this.checkIsWarningDismissedUser(user)
      this.warningToastr ?? this.getSystemNotifications()
    })
    this.getNotifications();
    this._notificationService.startNotificationConnection();
    this._notificationService.getNotificationListener()
    this._notificationService.startWarningConnection();
    this._notificationService.getWarningListener()
    this._notificationService.notificationWidget.subscribe(
      (notifications) => {
        this.notificationList = notifications
        this.notificationCount = notifications.filter((item) => { return item.Readed == false }).length
      }
    );
    this._notificationService.warningWidget.subscribe(
      (warning) => {
        if (warning?.Message) {
          this.warningToastr = true;
          this.warningToastItems = warning
          this.checkedWarning.emit(this.warningToastItems)
        } else {
          this.warningToastr = false;
        }
      }
    );
    this.getSystemNotifications()
    this.initForms()
    this.changeFormCondition()
    this.checkIsWarningDismissedUser(this.userId);
  }

  getSystemNotifications() {
    this._notificationService.getSystemNotifications()
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () => {
            this._toastr.showError('An errror ocurrs'),
              this.loading = false
          }
        })
      )
      .subscribe(warning => {
        this.loading = false;
        if (warning) {
          this.warningForm?.patchValue({
            id: warning.id,
            message: warning.message,
            expirationDate: warning.cancelAutomatically ? null : new Date(warning.expirationDate),
            hour: '00:00',
            hourDate: warning.cancelAutomatically ? null : new Date(warning.expirationDate),
            timeZone: warning.cancelAutomatically ? null : warning.timeZone,
            dismissable: warning.dismissable,
            lockoutNonAdminUsers: warning.lockoutNonAdminUsers
          })
          this.expireType = warning.cancelAutomatically ? '1' : '2'
          this.updateWarning = warning;
          this.checkIsWarningDismissedUser(this.userId)

          this.warningToastItems.Message = warning.message;
          this.warningToastItems.Dismissable = warning.dismissable;
        }
      })
  }

  getTimeZones() {
    this.timeZoneList$ = this._notificationService.getTimeZones()
      .pipe(
        tap({
          next: () => this.timeZoneLoading = false,
          error: () => this.timeZoneLoading = false
        })
      );
  }

  initForms() {
    this.notificationForm = new FormGroup({
      id: new FormControl<string | null>(null),
      message: new FormControl<string | null>('', [Validators.required, Validators.maxLength(200)]),
      creationDateTime: new FormControl<string>(new Date().toISOString()),
      sender: new FormControl<string>(this.userId),
      shareWith: new FormControl<string | null>(null),
      entities: new FormControl<string | null>(null),
      readed: new FormControl<boolean>(false)
    });
    this.warningForm = new FormGroup({
      id: new FormControl<string | null>(null),
      message: new FormControl<string | null>('', [Validators.required, Validators.maxLength(500)]),
      expirationDate: new FormControl<Date | null>(null),
      hour: new FormControl<string | null>(null),
      hourDate: new FormControl<Date | null>(null),
      timeZone: new FormControl<string | null>(null),
      dismissable: new FormControl<boolean>(false),
      lockoutNonAdminUsers: new FormControl<boolean>(false)
    });
  }

  closeForm() {
    this.showNotificationForm = this.showWarningForm = false;
    this.notificationForm.reset();
    this.warningForm.reset();
    this.initForms()
    this.entityLoading = this.userLoading = this.timeZoneLoading = true;
  }

  toggleNotifications() {
    if (!this.showNotifications) {
      this.showNotifications = true;
      // delete after login
      this.getNotifications();
      this.warningToastr ?? this.getSystemNotifications()
    } else {
      this.closeNotifications();
    }
  }

  closeNotifications() {
    this.showNotifications = false;
    this.closeForm();
  }

  markAsRead() {
    this.loading = true
    this._notificationService.markAsReadNotifications(this.userId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this.loading = false;
          this._toastr.showSuccess('All notifications marked as read', 'Notifications');
        },
        error: err => {
          this.loading = false;
          this._toastr.showWarning('Notification with issues', 'Notifications');
        }
      })
  }

  saveNotification() {
    this.notification = this.notificationForm.value;
    this.loading = true;
    this._notificationService.createNotification(this.notification)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this._toastr.showSuccess('Notification created', 'Notifications');
        },
        error: err => {
          this.loading = false;
          this._toastr.showWarning('Notification with issues', 'Notifications');
        },
        complete: () => {
          this.loading = false;
          this.closeNotifications();
          this.initForms()
        },
      })
  }

  getNotifications() {
    this._notificationService.getNotifications()
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () => {
            this._toastr.showError('An errror ocurrs'),
              this.loading = false
          }
        })
      )
      .subscribe(notifications => {
      })
  }

  saveWarning() {
    let warning: IWarning = {
      id: this.warningForm.get('id')?.value,
      message: this.warningForm.get('message')?.value,
      createdBy: this.userId,
      expirationDate: this.expireType == '1' ? this.autoTimeLocale() : this.setCustomTimeToLocale(this.warningForm.get('expirationDate')?.value, this.warningForm.get('hourDate')?.value),
      dismissable: this.warningForm.get('dismissable')?.value,
      cancelAutomatically: this.expireType == '1' ? true : false,
      lockoutNonAdminUsers: this.warningForm.get('lockoutNonAdminUsers')?.value,
      timeZone: this.expireType == '1' ? Intl.DateTimeFormat().resolvedOptions().timeZone : this.warningForm.get('timeZone')?.value,
      active: true,
      expirationDateUtc: ''
    }
    this.loading = true;

    this._notificationService.createWarning(warning)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this.loading = false;
          this.updateWarning = warning;
          this._toastr.showSuccess('Warning notification successfully created', '');
          this.closeNotifications();
        },
        error: err => {
          this.loading = false;
          this._toastr.showError(err);
        }
      });

  }

  updateWarnings() {
    let warning: IWarning = {
      id: this.warningForm.get('id')?.value,
      message: this.warningForm.get('message')?.value,
      createdBy: this.userId,
      expirationDate: this.expireType == '1' ? this.autoTimeLocale() : this.setCustomTimeToLocale(this.warningForm.get('expirationDate')?.value, this.warningForm.get('hourDate')?.value),
      dismissable: this.warningForm.get('dismissable')?.value,
      cancelAutomatically: this.expireType == '1' ? true : false,
      lockoutNonAdminUsers: this.warningForm.get('lockoutNonAdminUsers')?.value,
      timeZone: this.expireType == '1' ? Intl.DateTimeFormat().resolvedOptions().timeZone : this.warningForm.get('timeZone')?.value,
      active: true,
      expirationDateUtc: ''
    }

    this.loading = true;
    this._notificationService.updateWarning(warning)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this.loading = false;
          this._toastr.showSuccess('Warning notification successfully updated', '');
          this.closeNotifications();
        },
        error: err => {
          this.loading = false;
          this._toastr.showError(err);
          this.closeNotifications();
        }
      });
  }

  cancelWarnings() {
    this.loading = true;
    this._notificationService.deleteWarning()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this._toastr.showSuccess('Warning successfully deleted', '');
          this.updateWarning
          for (var member in this.updateWarning) delete this.updateWarning[member];
          this.warningForm.reset();
          this.loading = false;
          this.closeNotifications();
        },
        error: err => {
          this._toastr.showError(err);
          this.loading = false;
        }
      });

  }

  clearAll() {
    this.loading = true
    this._notificationService.clearAllNotifications(this.userId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this.loading = false;
          this._toastr.showSuccess('All notifications are cleared', 'Notifications');
        },
        error: err => {
          this.loading = false;
          this._toastr.showWarning('Notification with issues', 'Notifications');
        }
      })
  }

  collapseItem(index: number) {
    if (index == this.collapsableItem) {
      this.collapsableItem = -1;
    } else {
      this.collapsableItem = index;
    }
  }

  changeFormCondition() {
    if (this.expireType == '1') {
      for (const args of ['expirationDate', 'hour', 'hourDate', 'timeZone']) this.unsetRequired(args);
    } else {
      for (const args of ['expirationDate', 'hour', 'hourDate', 'timeZone']) this.setRequired(args);
    }
  }

  setRequired(controlName: string) {
    this.warningForm.get(controlName)?.setValidators([Validators.required]);
    this.warningForm.get(controlName)?.enable();
    this.warningForm.get(controlName)?.updateValueAndValidity();

    if (this.updateWarning.id) {
      this.warningForm.patchValue({
        expirationDate: this.updateWarning.cancelAutomatically ? null : new Date(this.updateWarning.expirationDate),
        hour: '00:00',
        hourDate: this.updateWarning.cancelAutomatically ? null : new Date(this.updateWarning.expirationDate),
        timeZone: this.updateWarning.cancelAutomatically ? '' : this.updateWarning.timeZone
      })
    }
  }

  unsetRequired(controlName: string) {
    if (this.warningForm.get('hour')?.value) {
      this.setHour.nativeElement.value = null;
    }
    this.warningForm.get(controlName)?.reset()
    this.warningForm.get(controlName)?.removeValidators(Validators.required)
    this.warningForm.get(controlName)?.updateValueAndValidity();

  }

  TransformHour(event) {
    this.warningForm.patchValue({
      hour: new Date(event.time).toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  }

  getUserList() {
    this.userList$ = this._userService.getList()
      .pipe(
        map((list) => {
          return list.filter((item) => {
            return item.notifications && item.active
          })
        }),
        tap({
          next: () => this.userLoading = false,
          error: () => this.userLoading = false
        })
      );
  }

  getEntities() {
    this.entityList$ = this._entityService.getList()
      .pipe(
        tap({
          next: () => this.entityLoading = false,
          error: () => this.entityLoading = false
        })
      );
  }

  changeFormType(type: number) {
    switch (type) {
      case 1:
      default:
        this.showNotificationForm = true;
        this.getEntities();
        this.getUserList();
        break;
      case 2:
        this.showWarningForm = true;
        this.getSystemNotifications()
        this.getTimeZones();
        break;

    }
  }

  deleteNotification(id: string) {
    this.loading = true;
    this._notificationService.deleteNotification(id)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this._toastr.showSuccess('Notification successfully deleted', '');
          this.loading = false;
        },
        error: err => {
          this._toastr.showError(err);
          this.loading = false;
        }
      });
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
        if (dismissed) { this.warningToastr = false; this.checkedWarning.emit() }
        else if (!dismissed && this.updateWarning.message) { this.warningToastr = true; this.checkedWarning.emit(this.warningToastItems) }
      })
  }

  autoTimeLocale() {
    let autoDate = new Date();
    autoDate.setDate(autoDate.getDate() + 1);
    var tzoffset = (autoDate).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(autoDate.getTime() - tzoffset)).toISOString().slice(0, -1);
    return localISOTime;
  }

  setCustomTimeToLocale(date: Date, hour: Date) {
    date.setHours(hour.getHours())
    date.setMinutes(hour.getMinutes())
    var tzoffset = (date).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1);

    return localISOTime;
  }

  get message(): FormControl {
    return this.notificationForm.get('message') as FormControl;
  }

  get warningMessage(): FormControl {
    return this.warningForm.get('message') as FormControl;
  }

  toLocalTimeConverter(date) {
    let typeDate = new Date(date);
    var localeDate = new Date(typeDate.getTime() - typeDate.getTimezoneOffset() * 60 * 1000);
    return localeDate.toISOString();
  }
}
