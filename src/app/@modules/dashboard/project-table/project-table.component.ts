import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Config, Pagination } from 'ngx-easy-table/lib';
import { API, APIDefinition, DefaultConfig } from 'ngx-easy-table';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { Subject, take, takeUntil, tap } from 'rxjs';
import { IProjectTable } from '../interfaces/projects.interface';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { NbDialogService } from '@nebular/theme';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { ActivityCodes, FSBConstants } from 'src/app/shared/Infrastructure/constants/constants';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { INotificationSystemGenerting } from 'src/app/@core/models/notification/notifications-widgets-model';
import { LoggerService } from 'src/app/@core/services/shared/logger/logger.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { IActivityLog } from 'src/app/@core/models/activity/activityLog';
import { ActivityService } from 'src/app/@core/services/activity/activity.service';
import { RoleManagerService } from 'src/app/auth/role-manager.service';

@Component({
  selector: 'app-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectTableComponent implements OnInit, OnChanges {
  @Input() tableData!: IProjectTable[];
  @Input() tableLength: number;
  @Output() tableDataLoaded: any = new EventEmitter();
  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('projectNameTpl', { static: true }) projectTpl: TemplateRef<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('startEndDateTpl', { static: true })
  startEndDateTpl: TemplateRef<any>;
  @ViewChild('projectNameActionTemplate', { static: true })
  projectNameActionTemplate: TemplateRef<any>;
  @ViewChild('entityEngagementActionTemplate', { static: true })
  entityEngagementActionTemplate: TemplateRef<any>;
  @ViewChild('fyActionTemplate', { static: true })
  fyActionTemplate: TemplateRef<any>;
  @ViewChild('startEndDateActionTemplate', { static: true })
  startEndDateActionTemplate: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl: TemplateRef<any>;
  @ViewChild('statusActionTemplate', { static: true })
  statusActionTemplate: TemplateRef<any>;
  @ViewChild('lastProcessedTpl', { static: true })
  lastProcessedTpl: TemplateRef<any>;
  @ViewChild('lastProcessedActionTemplate', { static: true })
  lastProcessedActionTemplate: TemplateRef<any>;
  @ViewChild('dueTbFsTpl', { static: true }) dueTbFsTpl: TemplateRef<any>;
  @ViewChild('dueTbFsActionTemplate', { static: true })
  dueTbFsActionTemplate: TemplateRef<any>;
  @ViewChild('deleteTpl', { static: true }) deleteTpl: TemplateRef<any>;
  @ViewChild('deleteActionTemplate', { static: true })
  deleteActionTemplate: TemplateRef<any>;

  public data: IProjectTable[] = [];
  public fullData: IProjectTable[] = [];
  columns: any = {};
  configuration: Config;
  public paginationTotalItems: number;
  public pagination: Pagination;
  private sectionName: string = 'Dashboard';

  @Output() checkedStatus = new EventEmitter<{ names: Set<string> }>();
  public selectedProjectName: string = '';
  public loading = false;
  public selectedProjectNameSet = new Set<string>([]);
  public selectedStatus: string = '';
  public selectedStatusSet = new Set<string>([]);
  public selectedEntityEngagement: string = '';
  public selectedFy: string = '';
  public selectedLastProcessed: string = '';
  public userName: string = '';
  private moduleId: string = 'ED3B62FF-E7B8-4122-8E3B-5E0E6F104F17'
  public projectNameFilters: string[] = new Array<string>();
  public statusFilters: string[] = new Array<string>();
  public pageIndex = 0;
  public deleted = false;
  public headers: Array<string[]> = [['id', 'Project Name', 'Entity/Engagement', 'FY', 'Start Date/End Date', 'Status', 'Last Processed', 'Due Dates - TB Upload/FS Review']];
  private readonly unSubscribe$ = new Subject<void>();
  public selectedStartEndDate: any = {
    startDate: null,
    endDate: null
  };
  public selectedDueTbFs: any = {
    startDate: null,
    endDate: null
  };
  public dateLimit = 730;

  newGuid = () => crypto.randomUUID();
  public currentDate: Date;

  constructor(private _dashService: DashboardService, private _router: Router,
    private _dialogService: NbDialogService, private _toastr: ToastrService,
    private notificationsServices: NotificationsServices,
    private logger: LoggerService,
    private globalCoaService: GlobalCoaService,
    private _activityService: ActivityService,
    private _roleManagerService: RoleManagerService,
    private engCoaService: EngagementCoaService,) { }

  ngOnInit(): void {
    this.currentDate = new Date();
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.paginator._intl.itemsPerPageLabel = "Show";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const pageRange = (length == 0) ? `0/0` : `${page + 1}/${Math.ceil(length / pageSize)}`;
      return `${pageRange}`;
    };
    this.columns = [
      {
        key: 'projectName',
        title: 'Project Name',
        cellTemplate: this.projectTpl,
        headerActionTemplate: this.projectNameActionTemplate,
      },
      {
        key: 'entitityEngagement',
        title: 'Entity / Engagement',
        headerActionTemplate: this.entityEngagementActionTemplate,
      },
      {
        key: 'fy',
        title: 'FY',
        headerActionTemplate: this.fyActionTemplate,
      },
      {
        key: 'startEndDate',
        title: 'Start Date / End Date',
        cellTemplate: this.startEndDateTpl,
        headerActionTemplate: this.startEndDateActionTemplate,
      },
      {
        key: 'status',
        title: 'Status',
        cellTemplate: this.statusTpl,
        headerActionTemplate: this.statusActionTemplate,
      },
      {
        key: 'lastProcessed',
        title: 'Last Processed',
        cellTemplate: this.lastProcessedTpl,
        headerActionTemplate: this.lastProcessedActionTemplate,
      },
      {
        key: 'dueTbFs',
        title: 'Due Dates- TB Upload / FS Review',
        cellTemplate: this.dueTbFsTpl,
        headerActionTemplate: this.dueTbFsActionTemplate,
      },
      {
        key: 'delete',
        title: '',
        cellTemplate: this.deleteTpl,
        headerActionTemplate: this.deleteActionTemplate,
        width: '5%'
      },
    ];
    this.statusFilters = ['New', 'ConfigureFS', 'TBUpload', 'FSReview', 'Completed'];
    this.loadTableItems();
    this.getUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.paginationTotalItems = this.tableLength;
    setTimeout(() => {
      this.paginator._changePageSize(10)
      this.paginator.pageIndex = 0;
    }, 100);
  }

  loadTableItems() {
    this._dashService.projectTable
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(items => {
        if (this._dashService.activeStatus.active) {
          this.tableData = items.filter((item) =>
            item.status === this._dashService.activeStatus.name ? item : ''
          );
          this.fullData = items.filter((item) =>
            item.status === this._dashService.activeStatus.name ? item : ''
          );
          this.deleted = false;
        } else {
          this.tableData = items;
          this.fullData = items;
        }

        this.paginationTotalItems = this.tableData.length;
        this.paginator._changePageSize(10)
        this.paginator.pageIndex = 0;
        if (this.deleted) {
          this.paginator.pageIndex = this.paginator.pageIndex = this.paginationTotalItems < this.pageIndex ? 0 : this.pageIndex
        }

        this.tableDataLoaded.emit({ data: this.tableData });
      })
  }

  deleteProject(row: IProjectTable) {
    this.pageIndex = this.paginator.pageIndex;
    this._dialogService.open(ConfirmDialogComponent, {
      context: {
        title: 'Delete Project',
        text: '<h3>Are you sure you want to <b>delete?</b></h3>',
        modalType: 'danger'
      },
    })
      .onClose.subscribe(data => {
        if (data.confirm) {
          this.loading = true;
          var message = FSBConstants.NotificationWidgetsMessages.ProjectDeleted.replace('{0}', row.name);
          var notification = {
            message: message,
            id: row.id
          } as INotificationSystemGenerting;
          this.notificationsServices.postNotificationByProject(notification)
            .pipe(tap({
              error: () => {
                this.logger.error(`${message}' Notification to save with issues to project Id:' ${row.id}`,)
                this.deleteProjectAction(row.id);
              }
            }))
            .subscribe(res => {
              this.deleteProjectAction(row.id);
            })

        }
      });
  }

  deleteProjectAction(id) {
    this._dashService.deleteProject(id).pipe(tap({
      error: () => {
        this._toastr.showError('An errror ocurrs'),
          this.loading = false;
      }
    }))
      .subscribe(deleted => {
        if (deleted) {
          this._toastr.showSuccess("Project Deleted", '');
          this._dashService.projectTable.next([])
          this.deleted = true;
          this.loading = false;
          this.globalCoaService.items.next([]);
          this.engCoaService.items.next([]);
        }
      })
  }

  filter(field: string, event: Event | any, isSet?: boolean): void {
    let value;
    if (field !== 'startEndDate' && field !== 'dueTbFs') {
      value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    }

    if (field === 'name' && !isSet) {
      this.selectedProjectNameSet.clear();
      this.selectedProjectName = value;
    }

    if (field === 'status' && !isSet) {
      this.selectedStatusSet.clear();
      this.selectedStatus = value;
    }

    if (field === 'status' && isSet) {
      this.selectedStatus = '';
      this.selectedStatusSet.has(value)
        ? this.selectedStatusSet.delete(value)
        : this.selectedStatusSet.add(value);
      this.checkedStatus.emit({ names: this.selectedStatusSet });
    }

    if (field === 'entitityEngagement') {
      this.selectedEntityEngagement = value;
    }
    if (field === 'fy') {
      this.selectedFy = value;
    }
    if (field === 'lastProcessed') {
      this.selectedLastProcessed = value;
    }

    this.tableData = [...this.fullData].filter(
      ({
        name,
        entitityEngagement,
        fy,
        startEndDate,
        status,
        lastProcessed,
        dueTbFs,
      }) => {
        let startDate = new Date(this.selectedStartEndDate!.startDate)
        let endDate = new Date(this.selectedStartEndDate!.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)

        let dueStartDate = new Date(this.selectedDueTbFs!.startDate)
        let dueEndDate = new Date(this.selectedDueTbFs!.endDate)
        dueStartDate.setHours(0, 0, 0, 0)
        dueEndDate.setHours(0, 0, 0, 0)

        if (this.selectedStatusSet.size != 0) {
          return (
            this.selectedStatusSet.has(status) &&
            name
              .toLocaleLowerCase()
              .includes(this.selectedProjectName.toLocaleLowerCase()) &&
            entitityEngagement
              .toLocaleLowerCase()
              .includes(this.selectedEntityEngagement.toLocaleLowerCase()) &&
            fy.toString()
              .toLocaleLowerCase()
              .includes(this.selectedFy.toLocaleLowerCase()) &&
            ((this.selectedStartEndDate === undefined || this.selectedStartEndDate.startDate === null) ? startEndDate :
              startDate <= new Date(startEndDate.substring(0, startEndDate.indexOf(' '))) &&
              endDate >= new Date(startEndDate.substring(startEndDate.indexOf(' ') + 1))) &&
            lastProcessed
              .toLocaleLowerCase()
              .includes(this.selectedLastProcessed.toLocaleLowerCase()) &&
            ((this.selectedDueTbFs === undefined || this.selectedDueTbFs.startDate === null) ? dueTbFs :
              dueStartDate <= new Date(dueTbFs!.substring(0, startEndDate.indexOf(' '))) &&
              dueEndDate >= new Date(dueTbFs!.substring(startEndDate.indexOf(' ') + 1)))
          );
        }
        return (
          name
            .toLocaleLowerCase()
            .includes(this.selectedProjectName.toLocaleLowerCase()) &&
          status
            .toLocaleLowerCase()
            .includes(this.selectedStatus.toLocaleLowerCase()) &&
          entitityEngagement
            .toLocaleLowerCase()
            .includes(this.selectedEntityEngagement.toLocaleLowerCase()) &&
          fy.toString()
            .toLocaleLowerCase()
            .includes(this.selectedFy.toLocaleLowerCase()) &&
          ((this.selectedStartEndDate === undefined || this.selectedStartEndDate.startDate === null) ? startEndDate :
            startDate <= new Date(startEndDate.substring(0, startEndDate.indexOf(' '))) &&
            endDate >= new Date(startEndDate.substring(startEndDate.indexOf(' ') + 1))) &&
          lastProcessed
            .toLocaleLowerCase()
            .includes(this.selectedLastProcessed.toLocaleLowerCase()) &&
          ((this.selectedDueTbFs === undefined || this.selectedDueTbFs.startDate === null) ? dueTbFs :
            dueStartDate <= new Date(dueTbFs!.substring(0, startEndDate.indexOf(' '))) &&
            dueEndDate >= new Date(dueTbFs!.substring(startEndDate.indexOf(' ') + 1)))
        );
      }
    );

    this.paginationTotalItems = this.tableData.length;
  }

  sortByAsc(field: string): void {
    if (field === 'timestamp') {
      this.tableData = [
        ...this.tableData.sort(
          (a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime()
        ),
      ];
      return;
    }

    this.tableData = [
      ...this.tableData.sort((a, b) => {
        const projectA = a[field].toLowerCase();
        const projectB = b[field].toLowerCase();
        return projectA.localeCompare(projectB);
      }),
    ];
  }

  sortByDesc(field: string): void {
    if (field === 'timestamp') {
      this.tableData = [
        ...this.tableData.sort(
          (a, b) => new Date(b[field]).getTime() - new Date(a[field]).getTime()
        ),
      ];
      return;
    }

    this.tableData = [
      ...this.tableData.sort((a, b) => {
        const projectA = a[field].toLowerCase();
        const projectB = b[field].toLowerCase();
        return projectB.localeCompare(projectA);
      }),
    ];
  }

  eventEmitted(id: string): void {
    this._router.navigate(['home/dashboard/project', id])
  }

  getUser() {
    const user = this._roleManagerService.getAuthLocalStorage();
    if (user) {
      this.userName = user.name;
    }
  }

  exportToExcel(fileName: string): void {
    let data = [...this.tableData];

    //Prepare xlsx file
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    ws['!cols'] = [];
    ws['!cols'][0] = { hidden: true };
    XLSX.utils.sheet_add_aoa(ws, this.headers);

    XLSX.utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, fileName + '.xlsx');

    this._toastr.showSuccess('Projects Successfully Downloaded');

    const log: IActivityLog = {
      activityTitle: FSBConstants.ActivityList.ExportProjectList.activity,
      activityDescription: FSBConstants.ActivityList.ExportProjectList.description,
      actionType: ActivityCodes.Download,
      moduleId: this.moduleId
    }
    this._activityService.saveActivityLog(log).pipe(takeUntil(this.unSubscribe$)).subscribe();
  }

  paginationEvent(event: PageEvent): void {
    this.pagination = {
      ...this.pagination,
      limit: event.pageSize,
      offset: event.pageIndex + 1,
      count: event.length,
    };
  }

  getStatusName(name: string) {
    switch (name) {
      case 'ConfigureFS':
        return 'Configure FS'
      case 'TBUpload':
        return 'TB Upload'
      case 'FSReview':
        return 'FS Review'
      case 'Completed':
        return 'Completed'
      default:
        return 'New'
    }
  }
}
