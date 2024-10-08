import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Config, Pagination } from "ngx-easy-table/lib";
import { APIDefinition, DefaultConfig } from "ngx-easy-table";
import { FormControl, Validators } from '@angular/forms';
import { NbDialogService, NbMenuService } from '@nebular/theme';
import { Subject, Subscriber, take, takeUntil, tap } from 'rxjs';
import { IUserModel, IUserModelRequest } from 'src/app/@core/models/user/user-model';
import { IGenericEntity } from 'src/app/@core/models/shared/entity-model';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { AddUserTeamsComponent } from '../add-user-teams/add-user-teams.component';
import { UserService } from 'src/app/@core/services/user/user.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { NbAccessChecker, NbRoleProvider } from '@nebular/security';
import { RoleConstants } from '../../../shared/Infrastructure/Constants/role-constants';
import { ThrottlingConstants } from '@azure/msal-common';

@Component({
  selector: 'app-view-user-teams',
  templateUrl: './view-user-teams.component.html',
  styleUrls: ['./view-user-teams.component.scss']
})
export class ViewUserTeamsComponent implements OnInit, OnDestroy {

  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('userTpl', { static: true }) userTpl: TemplateRef<any>;
  @ViewChild('roleTpl', { static: true }) roleTpl: TemplateRef<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('userHeaderActionTemplate', { static: true })
  userHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('roleHeaderActionTemplate', { static: true })
  roleHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('entitiesHeaderActionTemplate', { static: true })
  entitiesHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('ellipsesTpl', { static: true })
  ellipsesTpl!: TemplateRef<any>;
  @ViewChild('activeTpl', { static: true }) activeTpl!: TemplateRef<any>;
  @ViewChild('entityMappingTpl', { static: true }) entityMappingTpl!: TemplateRef<any>;

  private readonly unSubscribe$ = new Subject<void>();

  //data: any = [];
  data: IUserModel[] = [];
  dataCopy: any = [];
  columns: any = {};
  configuration: Config;
  public ellipseMenu: any = [];
  public renameIndex: number;
  renaming: boolean = false;
  private itemSelected: IUserModel;
  userRequestEdit: IUserModelRequest;
  item: any;
  userAccess: boolean = true;

  public selectedUser: string = '';
  public selectedRoleTitle: string = '';
  public selectedEntities: string = '';
  public nameInput = new FormControl('', [Validators.required]);
  public loadingUsers = false;
  public paginationTotalItems: number;
  public pagination: Pagination;

  constructor(
    private _userRole: NbRoleProvider,
    private menuUserService: NbMenuService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private userService: UserService,
    private accessChecker: NbAccessChecker) {
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  ngOnInit(): void {

    this.loadUsers();
    this.loadUserListener();

    this.configuration = { ...DefaultConfig };
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.paginator._intl.itemsPerPageLabel = "Show";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const pageRange = (length == 0) ? `0/0` : `${page + 1}/${Math.ceil(length / pageSize)}`;
      return `${pageRange}`;
    };
    this.setColumns();
    this.setMenu();
    this.selectedMenuItemListener();
  }

  saveChangesEvent(event) {
    alert('event');
  }

  updateTable() {
    this.paginationTotalItems = this.data.length;
    this.paginator.pageIndex = 0;
    this.pagination = {
      ...this.pagination,
      limit: this.paginator.pageSize,
      offset: this.paginator.pageIndex + 1,
      count: this.paginationTotalItems,
    };
  }

  loadUserListener() {
    this.userService.items
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(items => {

        if (items.length > 0) {
          this.data = items.map((item: any) => {
            return { ...item, minEntityList: item.listEntity.length > 0 ? item.listEntity.slice(0, 2) : [], toggle: false }
          });
        }
        else this.loadUsers();
      })
  }

  loadUsers() {
    this.loadingUsers = true;
    this.userService.getList()
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () => this.loadingUsers = false
        })
      )
      .subscribe(user => {

        if (user.length > 0) {
          this.data = user;
          this.userService.items.next(user);
          this.loadingUsers = false
          this.dataCopy = [...this.data];
          this.paginationTotalItems = this.data.length;
        }
      })
  }

  toggleNotifications(status: boolean, id: string) {
    this.loadingUsers = true;
    const element = this.data.find(x => x.id == id);
    if (element!.notifications != status) {
      this.userService.patch(id).pipe(tap({
        error: () => {
          this.toastr.showError('An errror ocurrs')
            , this.loadingUsers = false
        }
      }))
        .subscribe(res => {
          status ? this.toastr.showSuccess('User Notification Activated') : this.toastr.showSuccess('User Notification Deactivated')
          this.loadingUsers = false
          this.userService.items.next([]);
        })
    } else {
      this.loadingUsers = false;
    }
  }

  selectedMenuItemListener() {
    this.menuUserService.onItemClick()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(evt => {
        let id = '';
        let rowIndex = -1;
        const aux = evt.tag.split(',');
        if (aux.length > 0) {
          id = aux[0];
          rowIndex = Number(aux[1]);
        }
        this.itemSelected = this.data.find(item => item.id == id) as IUserModel;
        if (this.itemSelected) this.menuGoTo(evt.item.icon, rowIndex, this.itemSelected);
        //this.itemSelected.emit({ id: selected.id, name: selected.name, active: selected.active });
      });
  }

  menuGoTo(action, rowIndex?: number, userSelected?: IUserModel) {
    let headerLabel = '';
    switch (action) {
      case "edit":
        this.dialogService.open(AddUserTeamsComponent, {
          context: {
            title: headerLabel,
            itemUser: userSelected,
            isEdit: true
          },
          closeOnBackdropClick: false
        }).onClose.subscribe(item => {

        });
        break;
      case 'trash':
        headerLabel = 'Delete User';
        this.dialogService.open(DeleteDialogComponent, {
          context: {
            title: headerLabel,
            item: userSelected,
            fromTree: true
          },
          closeOnBackdropClick: false
        }).onClose.subscribe(value => {
          if (value != undefined) {
            if (value.deleted) {
              this.userService.delete(userSelected?.id!).pipe(tap({
                error: () => this.toastr.showError('An errror ocurrs'),
              }))
                .subscribe(deleted => {
                  if (deleted) {
                    this.toastr.showSuccess('Deleted');
                    this.userService.items.next([]);
                  }
                })
            }
          }
        });
        break;
    }
  }

  saveRename(): void {
    this.renaming = true;
  }

  cancelRename(): void {
    this.renameIndex = -1;
  }

  private setColumns(): void {
    const notifColumn = { key: 'notifications', title: 'Notifications', cellTemplate: this.activeTpl, width: 'auto' };
    const columns = [
      { key: 'userName', title: "User/E-Mail", cellTemplate: this.userTpl, headerActionTemplate: this.userHeaderActionTemplate, width: 'auto' },
      { key: 'role', title: 'User Role', cellTemplate: this.roleTpl, headerActionTemplate: this.roleHeaderActionTemplate, width: 'auto' },
      { key: 'listEntities', title: 'Assigned Entities', cellTemplate: this.entityMappingTpl, headerActionTemplate: this.entitiesHeaderActionTemplate, width: '35%' },
      notifColumn,

    ];

    this._userRole.getRole()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(role => {
        this.userAccess = role === RoleConstants.roleNames["Global Admin"] || role === RoleConstants.roleNames['System Admin'];
        if (columns.findIndex(x => x.key === 'id') === -1) {
          columns.push({ key: 'id', title: '', cellTemplate: this.ellipsesTpl, width: 'auto' })
        }
      });
    this.columns = columns;
  }

  private setMenu() {
    this.ellipseMenu = [
      { icon: 'edit', title: 'Edit' },
    ];

    this.accessChecker.isGranted('delete', 'user')
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(granted => {
        if (granted && this.ellipseMenu.length < 2) {
          this.ellipseMenu.push({ icon: 'trash', title: 'Delete' });
        }
      })


  }

  filter(field: string, event: Event | string): void {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;

    if (field === 'userName') {
      this.selectedUser = value;
      this.data = [...this.dataCopy].filter(({ userName, email
      }) => {
        return (
          userName.toLocaleLowerCase().includes(this.selectedUser.toLocaleLowerCase()) ||
          email.toLocaleLowerCase().includes(this.selectedUser.toLocaleLowerCase())
        );
      });
    }
    if (field === 'role') {
      this.selectedRoleTitle = value;
      this.data = [...this.dataCopy].filter(({ role }) => {
        return (
          role.name.toLocaleLowerCase().includes(this.selectedRoleTitle.toLocaleLowerCase())
        );
      });
    }
    if (field === 'listEntity') {
      this.selectedEntities = value;
      this.data = [...this.dataCopy].filter(({ listEntity }) => {
        return (
          this.selectedEntities !== '' ?
            listEntity.find(x => x.name.toLocaleLowerCase().includes(this.selectedEntities.toLocaleLowerCase()))
            : listEntity
        )
      });
    }
    this.updateTable();
  }

  sortByAsc(field: string): void {
    if (field == 'userName') {
      this.data = [
        ...this.data.sort((a, b) => {
          const userA = a[field].toLowerCase();
          const userB = b[field].toLowerCase();
          return userA.localeCompare(userB);
        }),
      ];
    }
    if (field == 'role') {
      this.data = [
        ...this.data.sort((a, b) => {
          const userA = a[field].name.toLowerCase();
          const userB = b[field].name.toLowerCase();
          return userA.localeCompare(userB);
        }),
      ];
    }
    if (field == 'listEntity') {
      this.data = [
        ...this.data.sort((a, b) => {
          let userA = '';
          let userB = '';

          a[field].forEach(ent => {
            userA = ent.name;
          })
          b[field].forEach(ent => {
            userB = ent.name;
          })
          return userA.localeCompare(userB);
        }),
      ];
    }
  }

  sortByDesc(field: string): void {
    if (field == 'userName') {
      this.data = [
        ...this.data.sort((a, b) => {
          const userA = a[field].toLowerCase();
          const userB = b[field].toLowerCase();
          return userB.localeCompare(userA);
        }),
      ];
    }
    if (field == 'role') {
      this.data = [
        ...this.data.sort((a, b) => {
          const userA = a[field].name.toLowerCase();
          const userB = b[field].name.toLowerCase();
          return userB.localeCompare(userA);
        }),
      ];
    }
    if (field == 'listEntity') {
      this.data = [
        ...this.data.sort((a, b) => {
          let userA = '';
          let userB = '';

          a[field].forEach(ent => {
            userA = ent.name;
          })
          b[field].forEach(ent => {
            userB = ent.name;
          })
          return userB.localeCompare(userA);
        }),
      ];
    }
  }

  toggleEntities = (value: boolean, rowData: any) => {
    if (value) {
      rowData.toggle = true;
      rowData.minEntityList = [...rowData.listEntity];
    } else {
      rowData.toggle = false;
      rowData.minEntityList = rowData.listEntity.slice(0, 2);
    }

  }

  paginationEvent(event: PageEvent): void {
    this.pagination = {
      ...this.pagination,
      limit: event.pageSize,
      offset: event.pageIndex + 1,
      count: event.length,
    };
  }
}
