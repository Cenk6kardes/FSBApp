import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, Subject } from 'rxjs';
import { IFilterItems, ISimpleFilterItems } from 'src/app/@modules/dashboard/interfaces/filter-items.interface';
import { IProjectSetup } from 'src/app/@modules/dashboard/interfaces/project-setup.interface';
import { IProjects, IProjectTable } from 'src/app/@modules/dashboard/interfaces/projects.interface';
import { IEntity } from '../../models/entityScreen/entityScreenModel.interface';
import { HttpService } from '../shared/http/http.service';
import { ProjectStatus, FilterNames } from 'src/app/shared/Infrastructure/constants/constants';
import * as signalR from '@microsoft/signalr';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { IStatusItems } from 'src/app/@modules/dashboard/interfaces/status-items.interface';
import { INote, INotes } from 'src/app/@modules/dashboard/interfaces/note.interface';
import { RoleManagerService } from 'src/app/auth/role-manager.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  public projectTable = new BehaviorSubject<IProjectTable[]>([]);
  public copyProjectTable = new BehaviorSubject<IProjectTable[]>([]);
  public projectDetails = new BehaviorSubject<IProjects>({
    id: '', name: '', entity: { id: '', name: '', active: true, deleted: false }, financialYear: NaN, periodStartDate: '', periodEndDate: '',
    periodBreak: { id: '', name: '', code: '', active: false }, projectType: { id: '', name: '', code: '', active: false }, coaType: { id: '', name: '', code: '', active: false }, globalCoa: '',
    engagementCoa: '', uploadDueDate: '', reviewDueDate: '', status: 'New', overdue: false, lastProcessed: '', balanceSource: ''
  });
  public pd = new Subject<IProjects>();
  public periodBreak = new Subject<string>();
  public completedStatus = new BehaviorSubject<boolean>(false);
  public loadingStatus = new BehaviorSubject<boolean>(false);
  public noteList = new BehaviorSubject<INote[]>([]);
  public activeStatus = { name: FilterNames.Overall.trim(), active: false }

  public _dummyItems: IFilterItems[] = [
    {
      header: 'Overall Projects',
      count: 0,
      diff: 5,
      icon: 'overall-projects',
      arrow: 'increase-arrow',
      checked: true,
    },
    {
      header: 'New Projects',
      count: 0,
      diff: 2,
      status: 'New',
      icon: 'new',
      arrow: 'increase-arrow',
      checked: false,
    },
    {
      header: 'Configure FS',
      count: 0,
      diff: 1,
      status: 'ConfigureFS',
      icon: 'configurefs',
      arrow: 'decrease-arrow',
      checked: false,
    },
    {
      header: 'TB Upload',
      count: 0,
      diff: 1,
      status: 'TBUpload',
      icon: 'tbupload',
      arrow: 'decrease-arrow',
      checked: false,
    },
    {
      header: 'FS Review',
      count: 0,
      diff: 4,
      status: 'FSReview',
      icon: 'fsreview',
      arrow: 'increase-arrow',
      checked: false,
    },
    {
      header: 'Completed',
      count: 0,
      diff: 5,
      icon: 'completed',
      status: 'Completed',
      arrow: 'increase-arrow',
      checked: false,
    },
  ];

  public dummyStatus: IStatusItems[] = [
    {
      header: 'TB Upload',
      contents: [
        {
          text: 'Completed',
          count: 0,
          percent: 0,
        },
        {
          text: 'In Progress',
          count: 0,
          percent: 0,
        },
        {
          text: 'Not Started',
          count: 0,
          percent: 0,
        },
      ],
      type: 'status',
      overdue: 0,
    },
    {
      header: 'FS Review',
      contents: [
        {
          text: 'Completed',
          count: 0,
          percent: 0,
        },
        {
          text: 'In Progress',
          count: 0,
          percent: 0,
        },
        {
          text: 'Not Started',
          count: 0,
          percent: 0,
        },
      ],
      type: 'status',
    },
  ];
  private uri: string = "dashboard";

  private userId: string = '';
  private _hubConnection: signalR.HubConnection;
  public simple: ISimpleFilterItems[] = [{ Name: '', Quantity: '-1' }];
  private changedProjects = new Subject<{ loadingType: boolean, fetch: boolean }>();
  cProject$ = this.changedProjects.asObservable();

  constructor(private httpService: HttpService,
    private _datePipe: DatePipe,
    private roleManager: RoleManagerService
  ) {
    this.roleManager._userId.subscribe(id => { if (id) this.userId = id });
  }

  // Get Top filter Cards
  getFilterItems(): IFilterItems[] {
    return this._dummyItems;
  }

  // Get Top TB Upload - FS Review Cards 
  getStatusItems(): IStatusItems[] {
    return this.dummyStatus;
  }

  //Top filters filter
  updateItemUI(status: string | undefined): void {
    if (status) {
      this.activeStatus.active = true;
      this.activeStatus.name = status;
    } else {
      this.activeStatus.active = false;
      this.activeStatus.name = FilterNames.Overall.trim();
    }

    this.projectTable.next([])
    setTimeout(() => {
      this.projectTable.next(this.copyProjectTable.getValue())
    }, 100);
  }

  fillFilterItems(tableData: [{ Name: string, Quantity: string }]) {
    tableData.filter(item => {
      item.Name.trim() === FilterNames.Overall.trim() ? this._dummyItems[0].count = parseInt(item.Quantity) : null
      item.Name.trim() === FilterNames.NewProjects.trim() ? this._dummyItems[1].count = parseInt(item.Quantity) : null
      item.Name.trim() === FilterNames.ConfigureFS.trim() ? this._dummyItems[2].count = parseInt(item.Quantity) : null
      item.Name.trim() === FilterNames.TBUpload.trim() ? this._dummyItems[3].count = parseInt(item.Quantity) : null
      item.Name.trim() === FilterNames.FSReview.trim() ? this._dummyItems[4].count = parseInt(item.Quantity) : null
      item.Name.trim() === FilterNames.Completed.trim() ? this._dummyItems[5].count = parseInt(item.Quantity) : null
    })
  }

  createProject(project: IProjectSetup) {
    return this.httpService.post<string>(project, `${this.uri}/project`)
      .pipe(
        catchError(err => {
          throw 'An errror ocurred';
        })
      );
  }

  // Get all project for dashboard
  getAllProjects(): Observable<IProjects[]> {
    return this.httpService.get<IProjects[]>(`${this.uri}/project`);
  }

  updateProject(project: IProjectSetup) {
    return this.httpService.put<IProjects[]>(project, `${this.uri}/project`);
  }

  // Delete project from table
  deleteProject(id: string) {
    return this.httpService.delete<boolean>(id, `${this.uri}/project`);
  }

  getProjectById(id: string): Observable<IProjects> {
    return this.httpService.get<IProjects>(`${this.uri}/project/${id}`)
      .pipe(
        tap({
          next: result => {
            this.completedStatus.next(result.status === ProjectStatus.Completed)
          }
        })
      );
  }

  // Get all notes for dashboard
  getAllNotes(): Observable<INote[]> {
    return this.httpService.get<INote[]>(`${this.uri}/note`);
  }

  // Add note to dashboard
  addNote(note: INote) {
    return this.httpService.post<INote>(note, `${this.uri}/note`)
      .pipe(
        catchError(err => {
          throw 'An errror ocurred';
        })
      );
  }

  // Edit note on dashboard
  editNote(note: INote) {
    return this.httpService.put<INote>(note, `${this.uri}/note`)
  }

  // Delete note from dashboard
  deleteNote(id: string) {
    return this.httpService.delete<boolean>(id, `${this.uri}/note`);
  }

  changeStatus(project: IProjects, newStatus: string) {
    let statusVal = Object.keys(ProjectStatus).indexOf(newStatus);
    this.loadingStatus.next(true);
    return this.httpService.put({ id: project.id, status: statusVal }, `${this.uri}/project/UpdateStatus`)
      .pipe(
        catchError(err => {
          throw 'Status could not be changed';
        }),
        tap({
          next: result => {
            this.completedStatus.next(newStatus === ProjectStatus.Completed);
            this.projectDetails.next({ ...project, status: newStatus });
            this.projectTable.next(this.projectTable.value.map((project: IProjectTable) => {
              project.status = project.id == this.projectDetails.value.id ? this.projectDetails.value.status : project.status
              return project
            }))
            this.loadingStatus.next(false);
          },
          error: () => { this.loadingStatus.next(false); }
        })
      );
  }

  startConnectionWidgets() {
    if (environment.production) {
      this._hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://dashboardapi01.azurewebsites.net/widgetsinfo?UserGuid=${this.userId}`)
        .build()
    } else {
      this._hubConnection = new signalR.HubConnectionBuilder()
        //.configureLogging(signalR.LogLevel.Trace)
        .withUrl(`https://localhost:7052/widgetsinfo?UserGuid=${this.userId}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .build()
    }
    this._hubConnection.start()
      .then(() => console.log('connection started'))
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  getWidgetsListener() {
    return this._hubConnection.on('OverallProjects', (data) => {
      if ((JSON.parse(data))?.TotalsForWidgets.length > 0) this.fillFilterItems((JSON.parse(data)).TotalsForWidgets)
      if ((Math.abs(parseInt(JSON.parse(data)?.TotalsForWidgets[0].Quantity) - parseInt(this.simple[0].Quantity)) == 1 || JSON.parse(data)?.TotalsForWidgets[0].Quantity == '0') && this.simple[0].Quantity != '-1') {
        this.changedProjects.next({ loadingType: true, fetch: true });
      } else this.changedProjects.next({ loadingType: false, fetch: false });
      this.simple = [...JSON.parse(data).TotalsForWidgets]

      if (JSON.parse(data).TbUploadWidgetResponse) {
        this.fillWidgets(JSON.parse(data)?.TbUploadWidgetResponse, 0)
      }
      if (JSON.parse(data).FsReviewWidgetResponse) {
        this.fillWidgets(JSON.parse(data)?.FsReviewWidgetResponse, 1)
      }
    })
  }

  fillWidgets(data, id) {
    this.dummyStatus[id].contents[0].count = data.Completed
    this.dummyStatus[id].contents[0].percent = parseInt(data.PercentajeCompleted);
    this.dummyStatus[id].contents[1].count = data.InProgress
    this.dummyStatus[id].contents[1].percent = parseInt(data.PercentajeInProgress);
    this.dummyStatus[id].contents[2].count = data.NotStarted
    this.dummyStatus[id].contents[2].percent = parseInt(data.PercentajeNotStarted);
    this.dummyStatus[id].overdue = data?.Overdue
  }

  getHasPreviousYear(entityName: IEntity, financialYear: number) {
    return this.httpService.get<boolean>(`${this.uri}/project/haspreviousYear/${entityName.id}/${financialYear}`);
  }

  setDate(value: string | Date) {
    let date = new Date(value);
    let time = date.getTime();
    let offset = date.getTimezoneOffset();
    let multiplier = offset <= 0 ? 1 : -1;
    let final = time + (multiplier * Math.abs(offset * 60000));
    return new Date(final).toISOString();
  }
}
