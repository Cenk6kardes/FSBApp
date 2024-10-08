import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {Config, Pagination} from "ngx-easy-table/lib";
import {API, APIDefinition, DefaultConfig} from "ngx-easy-table";
import {ActivityService} from "../../../@core/services/activity/activity.service";
import * as XLSX from 'xlsx';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {IActivityLog} from "../../../@core/models/activity/activityLog";
import {Subject, takeUntil} from "rxjs";
import {RoleManagerService} from "../../../auth/role-manager.service";
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-activity-chart',
  templateUrl: './activity-chart.component.html',
  styleUrls: ['./activity-chart.component.scss']
})
export class ActivityChartComponent implements OnInit, OnDestroy {

  @ViewChild('table', {static: true}) table: APIDefinition;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild('userTpl', {static: true}) userTpl: TemplateRef<any>;
  @ViewChild('timestampTpl', {static: true}) timestampTpl: TemplateRef<any>;
  @ViewChild('userHeaderActionTemplate', {static: true})
  userHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('activityTitleHeaderActionTemplate', {static: true})
  activityTitleHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('activityDescHeaderActionTemplate', {static: true})
  activityDescHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('timestampHeaderActionTemplate', {static: true})
  timestampHeaderActionTemplate: TemplateRef<any>;

  data: any = [];
  dataCopy: any = [];
  columns: any = {};
  configuration: Config;
  position: string = "left";
  headers: Array<string[]> = [['User', 'Activity Title', 'Activity Description', 'Timestamp']];

  @Output() checkedUser = new EventEmitter<{ names: Set<string> }>();

  public selectedUser: string = '';
  public selectedUserSet = new Set<string>([]);
  public selectedActivityTitle: string = '';
  public selectedActivityDesc: string = '';
  public userNameFilters: string[] = new Array<string>;
  public selectedDate: any = {
    startDate: null,
    endDate: null
  };
  public dateLimit = 730;
  public paginationTotalItems: number;
  public pagination: Pagination;

  private sectionName: string = 'Activity';
  private userName: string = '';
  private moduleId: string = 'ED3B62FF-E7B8-4122-8E3B-5E0E6F104F17'

  private readonly unSubscribe$ = new Subject<void>();

  constructor(private activityService: ActivityService,
              private roleManagerService: RoleManagerService) {
  }

  ngOnInit(): void {
    this.columns = [
      {key: 'username', title: "User", cellTemplate: this.userTpl, headerActionTemplate: this.userHeaderActionTemplate},
      {key: 'activityTitle', title: 'Activity Title', headerActionTemplate: this.activityTitleHeaderActionTemplate},
      {
        key: 'activityDescription',
        title: 'Activity Description',
        headerActionTemplate: this.activityDescHeaderActionTemplate
      },
      {
        key: 'createdDate',
        title: 'Timestamp',
        cellTemplate: this.timestampTpl,
        headerActionTemplate: this.timestampHeaderActionTemplate
      }
    ];
    this.configuration = {...DefaultConfig};
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.paginator._intl.itemsPerPageLabel = "Show";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const pageRange = (length == 0) ? `0/0` : `${page + 1}/${Math.ceil(length / pageSize)}`;
      return `${pageRange}`;
    };
    this.getActivityLog();
    this.getUser();
  }

  getUser() {
    const user = this.roleManagerService.getAuthLocalStorage();
    if(user){
      this.userName = user.name;
    }
  }

  getActivityLog() {
    this.activityService.getAllActivityLog().subscribe(data => {
      if (data.length > 0) {
        this.data = Object.values(data);
        this.dataCopy = [...this.data];
        this.getUniqueValues('username', data);
        this.paginationTotalItems = this.data.length;
      }
    });
  }

  getUniqueValues(field: string, data?: any): void {
    data.forEach(obj => {
      this.userNameFilters.push(obj[field]);
    });
    this.userNameFilters = Array.from(new Set(this.userNameFilters));
  }

  filter(field: string, event: Event | any, userSet?: boolean): void {
    let value;

    if (field !== 'createdDate') {
      value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    }

    if (field === 'username' && !userSet) {
      this.selectedUserSet.clear();
      this.selectedUser = value;
    }

    if (field === 'username' && userSet) {
      this.selectedUser = '';
      this.selectedUserSet.has(value)
        ? this.selectedUserSet.delete(value)
        : this.selectedUserSet.add(value);
      this.checkedUser.emit({names: this.selectedUserSet});
    }

    if (field === 'activityTitle') {
      this.selectedActivityTitle = value;
    }
    if (field === 'activityDescription') {
      this.selectedActivityDesc = value;
    }

    this.data = [...this.dataCopy].filter(({username, activityTitle, activityDescription, createdDate}) => {
      return (
        (this.selectedUserSet.size != 0 ? this.selectedUserSet.has(username) : username.toLocaleLowerCase().includes(this.selectedUser.toLocaleLowerCase())) &&
        activityTitle.toLocaleLowerCase().includes(this.selectedActivityTitle.toLocaleLowerCase()) &&
        activityDescription.toLocaleLowerCase().includes(this.selectedActivityDesc.toLocaleLowerCase()) &&
        ((this.selectedDate === undefined || this.selectedDate.startDate === null) ? createdDate : new Date(this.selectedDate.startDate) <= new Date(createdDate) && new Date(this.selectedDate.endDate) >= new Date(createdDate))
      );
    });
    this.updateTable();
  }

  sortByAsc(field: string): void {
    if (field === 'createdDate') {
      this.data = [
        ...this.data.sort((a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime())
      ];
      return;
    }

    this.data = [
      ...this.data.sort((a, b) => {
        const userA = a[field].toLowerCase();
        const userB = b[field].toLowerCase();
        return userA.localeCompare(userB);
      }),
    ];
  }

  sortByDesc(field: string): void {
    if (field === 'createdDate'
    ) {
      this.data = [
        ...this.data.sort((a, b) => new Date(b[field]).getTime() - new Date(a[field]).getTime())
      ];
      return;
    }

    this.data = [
      ...this.data.sort((a, b) => {
        const userA = a[field].toLowerCase();
        const userB = b[field].toLowerCase();
        return userB.localeCompare(userA);
      }),
    ];
  }

  paginationEvent($event: PageEvent): void {
    this.pagination = {
      ...this.pagination,
      limit: $event.pageSize,
      offset: $event.pageIndex + 1,
      count: $event.length,
    };
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

  exportToExcel(fileName: string): void {
    //Removing email from data
    let data = [...this.data];

    data.forEach(obj => {
      delete obj.email;
    });

    //Prepare xlsx file
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, this.headers);

    XLSX.utils.sheet_add_json(ws, data, {origin: 'A2', skipHeader: true});

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, fileName + '.xlsx');

    const log: IActivityLog = {
      activityTitle: 'Download ' + this.sectionName,
      activityDescription: this.userName + ' downloaded ' + this.sectionName,
      actionType: 4,
      moduleId: this.moduleId
    }

    this.activityService.saveActivityLog(log).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        if (result) {
          this.getActivityLog();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

}
