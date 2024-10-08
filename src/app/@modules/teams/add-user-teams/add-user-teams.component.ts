import { Component, Input, OnInit, ɵbypassSanitizationTrustResourceUrl, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Observable, of, take, tap, takeUntil, Subject } from 'rxjs';
import { IEntity } from 'src/app/@core/models/entityScreen/entityScreenModel.interface';
import { INotificationSystemGenerting } from 'src/app/@core/models/notification/notifications-widgets-model';
import { IRole } from 'src/app/@core/models/role/role-model';
import { IGenericEntity } from 'src/app/@core/models/shared/entity-model';
import { IUserModel, IUserModelRequest } from 'src/app/@core/models/user/user-model';
import { EntityService } from 'src/app/@core/services/entity/entity.service';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { UserService } from 'src/app/@core/services/user/user.service';
import { FSBConstants, NotificationType } from 'src/app/shared/Infrastructure/constants/constants';
import { NbAccessChecker } from '@nebular/security';
import { RoleConstants } from 'src/app/shared/Infrastructure/Constants/role-constants';

@Component({
  selector: 'app-add-user-teams',
  templateUrl: './add-user-teams.component.html',
  styleUrls: ['./add-user-teams.component.scss'],
  providers: [NotificationsServices]
})
export class AddUserTeamsComponent implements OnInit, OnDestroy {

  @Input() title: string = '';
  @Input() itemUser: IUserModel;
  @Input() isEdit: boolean = false;

  public form: FormGroup;
  public role: IRole[] = [];
  public rolelst: IRole[] = []
  public entitieslst: IEntity[] = [];
  public optionsEntity: IEntity[] = [];
  public searchPlHolder = '';
  public searchEntity = '';
  public selectedEntities = [];
  public userRequest: IUserModelRequest[] = [];
  public userNotificationRequest: INotificationSystemGenerting[] = [];
  public userRequestEdit: IUserModelRequest
  public index: number = -1;
  public isAdmin: boolean = true;
  public isloading: boolean = false;
  newGuid = () => crypto.randomUUID();


  public entityTypes$: Observable<IGenericEntity[]>;

  private emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


  get userFormArray() {
    return this.form.get('userFormArray') as FormArray;
  }
  get userForm() {
    return this.form.get('userForm');
  }

  get id() {
    return this.form.get('userForm.id');
  }

  get userName() {
    return this.form.get('userForm.userName');
  }

  get email() {
    return this.form.get('userForm.email');
  }

  get roleForm() {
    return this.form.get('userForm.role')?.value;
  }

  get entitiesForm() {
    return this.form.get('userForm.entities')?.value;
  }

  public updateUserPerm: boolean;
  private readonly unSubscribe$ = new Subject<void>();

  constructor(private formBuilder: FormBuilder,
    protected ref: NbDialogRef<AddUserTeamsComponent>,
    private toastr: ToastrService,
    private entityService: EntityService,
    private userService: UserService,
    private notificationsServices: NotificationsServices,
    private accessChecker: NbAccessChecker) { }
  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  ngOnInit(): void {

    this.initForm();
    this.getRole();
    this.loadEntities();
    this.userFormArray.clear();
    if (this.isEdit) {
      if (this.itemUser != undefined && this.itemUser.id != '') {
        this.updateUser();
      }
    }
  }

  updateUser() {

    this.form.controls['userForm'].patchValue({
      id: this.itemUser.id, userName: this.itemUser.userName,
      email: this.itemUser.email
    })

  }

  test(item) {
    this.selectedEntities = []
  }

  getRole() {
    this.isloading = true;
    this.userService.getUserRoles()
      .pipe(take(1),
        tap({
          error: () => this.isloading = false
        }))
      .subscribe(role => {
        this.role = role;
        this.isloading = false;
        if (this.isEdit) {
          if (this.itemUser.role) {
            this.userForm?.get('role')?.patchValue(this.role.find(x => x.id == this.itemUser.role.id)?.id);
            console.log(this.itemUser.role.name.toLowerCase(), RoleConstants.roleNames.Reviewer);

            if (this.itemUser.role.name.toLowerCase() === RoleConstants.roleNames.Reviewer)
              this.accessChecker.isGranted('update', RoleConstants.roleNames.Reviewer)
                .pipe(takeUntil(this.unSubscribe$))
                .subscribe(granted => {
                  if (!granted) {
                    this.form.get('userForm.entities')?.disable();
                  }
                });

          }
        }
      });
  }

  initForm() {
    this.form = new FormGroup({
      'userForm': new FormGroup({
        'id': new FormControl<string>(''),
        'userName': new FormControl<string>('', [Validators.required, Validators.pattern("^[0-9a-zA-Z ]*$")]),
        'email': new FormControl<string>('', [Validators.pattern(this.emailPattern)]),
        'role': new FormControl<IRole[]>([], [Validators.required]),
        'entities': new FormControl<IEntity[]>([]),
      }),
      'userFormArray': new FormArray([new FormGroup({
        'idArray': new FormControl<string>(''),
        'userNameArray': new FormControl<string>('', [Validators.required, Validators.pattern("^[0-9a-zA-Z ]*$")]),
        'emailArray': new FormControl<string>('', [Validators.pattern(this.emailPattern)]),
        'roleArray': new FormControl<IRole[]>([], [Validators.required]),
        'entitiesArray': new FormControl<IEntity[]>([]),
      })]),
    });

    this.accessChecker.isGranted('update', 'userFields')
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(granted => {
        if (!granted) {
          this.form.get('userForm.userName')?.disable();
          this.form.get('userForm.email')?.disable();
          this.form.get('userForm.role')?.disable();
        }
      });
  }

  editUser(index) {
    var val = this.userFormArray.controls[index].value
    var idArray = val.idArray;
    if (idArray) {
      this.form.controls['userForm'].setValue({
        id: idArray, userName: val.userNameArray,
        email: val.emailArray, role: val.roleArray, entities: val.entitiesArray
      })
      this.index = index;
    }
  }

  removeUser(index) {
    this.userFormArray.removeAt(index);
  }

  close() {
    this.ref.close({ action: false });
  }

  addNewUser() {

    if (this.form.valid) {
      if (this.id?.value != null && this.id?.value != '') {
        if (this.isEdit) {
          this.setUserToArray();
        } else {
          this.removeUser(this.index);
          this.setUserToArray();
        }
      } else {
        this.setUserToArray();
      }

    }
  }

  disableAddNewUser(): boolean {
    if (this.userForm?.valid && !(this.userFormArray.controls.length >= 1)) {
      return false;
    }

    if (!this.userForm?.valid && (this.userFormArray.controls.length >= 1)) {
      return false;
    }
    return true;
  }

  setUserToArray() {

    var idGuid = '';
    if (this.isEdit) {
      idGuid = this.id?.value;
    }
    else {
      idGuid = this.newGuid();
    }
    const userGroupBuilder = this.formBuilder.group({
      'idArray': new FormControl<string>(idGuid),
      'userNameArray': new FormControl<string>(this.userName?.value, [Validators.required, Validators.pattern("^[0-9a-zA-Z ]*$")]),
      'emailArray': new FormControl<string>(this.email?.value ?? "", [Validators.pattern(this.emailPattern)]),
      'roleArray': new FormControl<IRole[]>(this.roleForm),
      'entitiesArray': new FormControl<IEntity[]>(this.entitiesForm ?? [])
    });
    this.userFormArray.push(userGroupBuilder);
    this.form.controls['userForm'].reset();
  }

  loadEntities() {
    this.isloading = true;
    this.entityService.getList()
      .pipe(take(1),
        tap({
          error: () => this.isloading = false
        }))
      .subscribe(items => {
        this.optionsEntity = items;
        this.isloading = false;
        if (this.isEdit) {
          if (this.itemUser != undefined && this.itemUser.listEntity.length > 0) {

            this.form.get('userForm')?.patchValue({
              'entities': this.itemUser.listEntity.map(items => items.id)
            });
          }
        }
      });
  }


  onSave() {
    this.addNewUser();
    this.isloading = true;

    if (this.isEdit) {
      this.userRequestEdit = {} as IUserModelRequest;

      var useredit = this.userFormArray.controls[0].value;
      var newuser = {
        id: useredit.idArray,
        name: useredit.userNameArray,
        email: useredit.emailArray,
        roleID: useredit.roleArray,
        listEntity: useredit.entitiesArray,
        notifications: true

      } as IUserModelRequest
      this.userRequestEdit = newuser;

      this.userService.update(this.userRequestEdit).pipe(take(1),
        tap({ error: () => { this.toastr.showWarning('Not edited'); this.isloading = false } })
      )
        .subscribe(result => {
          if (result) {
            this.toastr.showSuccess('User Updated');
            this.isloading = false;
            this.ref.close({ action: true });
            this.userService.items.next([]);
          }
        })
    } else {

      this.userRequest = [];
      this.userNotificationRequest = [];

      var message = FSBConstants.NotificationWidgetsMessages.UserAddedToEntity;

      this.userFormArray.controls.forEach((item) => {
        var userarray = item.value;
        var newuser = {
          id: userarray.idArray,
          name: userarray.userNameArray,
          email: userarray.emailArray,
          roleID: userarray.roleArray,
          listEntity: userarray.entitiesArray,
          notifications: true

        } as IUserModelRequest
        this.userRequest.push(newuser);
      })
      this.userService.post(this.userRequest).pipe(take(1),
        tap({ error: () => { this.toastr.showWarning('Not saved'); this.isloading = false } })
      )
        .subscribe(arrayIds => {
          if (arrayIds) {
            arrayIds.forEach((res: any) => {
              if (res.status == 200) {
                this.toastr.showSuccess('User Saved');

                var exist = this.userNotificationRequest.find(x => x.id == res.response);

                if (!exist) {
                  var userNotification = {
                    id: res.response,
                    message: message,
                  } as INotificationSystemGenerting
                  this.userNotificationRequest.push(userNotification);
                }
              } else if (res.status == 409) {
                this.toastr.showWarning(res.response);
              }
              else {
                this.toastr.showWarning('One of the records was not saved');
              }

            })
            this.notificationsServices.postNotificationUserByEntities(this.userNotificationRequest)
              .pipe(take(1))
              .subscribe(res => {
                if (res)
                  this.toastr.showSuccess('Notification added', 'Notifications');
                else
                  this.toastr.showWarning('Notification with issues', 'Notifications');
              })
            this.isloading = false;
            this.ref.close({ action: true });
            this.userService.items.next([]);
          }
        })
    }
  }
}
