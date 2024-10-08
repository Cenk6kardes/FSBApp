import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, takeUntil, tap } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { IFilterItems } from './interfaces/filter-items.interface';
import { IStatusItems } from './interfaces/status-items.interface';
import { IProjectTable } from './interfaces/projects.interface';
import { ProjectTableComponent } from './project-table/project-table.component';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public nameCriteria = new Set<string>([]);
  public dummyItems!: IFilterItems[];
  public dummyStatus!: IStatusItems[];
  public routerActive: boolean = false;
  public loading = false;
  paramTableData: IProjectTable[] = [];
  originalParamTableData: IProjectTable[] = [];
  private readonly unSubscribe$ = new Subject<void>();
  @ViewChild('projectChart') projectChart: ProjectTableComponent;

  //#region Table config props
  public configuration!: Config;
  public tableData: IProjectTable[] = [];
  projectFilters: any[] = [];


  constructor(private dashService: DashboardService, private router: Router, private _datePipe: DatePipe, private _toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.initTableConfig();
    this.dummyItems = this.dashService.getFilterItems();
    this.dummyStatus = this.dashService.getStatusItems();
    this.getAllProjects(true, true)
    this.dashService.startConnectionWidgets();
    this.dashService.getWidgetsListener();
    this.dashService.cProject$.subscribe(
      (dashboardChanged) => {
        dashboardChanged.fetch === true ? this.getAllProjects(true, true) : ''
      }
    );
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  private initTableConfig() {
    this.configuration = { ...DefaultConfig };
    this.configuration.orderEnabled = true;
  }

  downloadReport() {
    this.projectChart.exportToExcel('projects');
  }

  getFilterCriteria(event: any) {
    this.nameCriteria = event.names;
  }

  goProjectSetup() {
    this.router.navigate(['home/dashboard/projectsetup']);
  }

  onActivate(evt: Event) {
    this.routerActive = true;
  }

  onDeactivate(evt: Event) {
    this.routerActive = false;
  }

  getAllProjects(loadingType: boolean, fetch: boolean) {
    this.loading = loadingType ?? true;
    if (fetch) {
      this.dashService.getAllProjects()
        .pipe(takeUntil(this.unSubscribe$),
          tap({
            error: () => {
              this._toastr.showError('An errror ocurrs'),
                this.loading = false
            }
          })
        )
        .subscribe(projects => {
          this.tableData = [];
          if (projects) {
            projects.map(project => this.tableData.push({
              id: project.id,
              name: project.name,
              entitityEngagement: project.entity ? project.entity.name : 'Orion Test 1',
              fy: project.financialYear.toString(),
              startEndDate: `${this._datePipe.transform(project.periodStartDate, 'MM-dd-yyyy')} ${this._datePipe.transform(project.periodEndDate, 'MM-dd-yyyy')}`,
              status: project.status,
              lastProcessed: project.lastProcessed,
              dueTbFs: `${this._datePipe.transform(project.uploadDueDate, 'MM-dd-yyyy')} ${this._datePipe.transform(project.reviewDueDate, 'MM-dd-yyyy')}`,
              dueTb: `${this._datePipe.transform(project.uploadDueDate, 'MM-dd-yyyy')}`,
              dueFs: `${this._datePipe.transform(project.reviewDueDate, 'MM-dd-yyyy')}`,
              overdue: project.overdue,
            }
            ))
          }
          this.dashService.projectTable.next([])
          this.dashService.copyProjectTable.next([])
          setTimeout(() => {
            this.dashService.projectTable.next(this.tableData);
            this.dashService.copyProjectTable.next(this.tableData);
          }, 100);

          this.loading = false;
        })
    }
  }

  onFilterFired = (data: any) => {
    if (data.filterType) {
      const val = data.filterType
      const index = this.projectFilters.findIndex((item: any) => {
        return (val.category === item.category && val.text === item.text);
      });
      if (index === -1) {
        this.projectFilters.push({ ...val, name: val.category + ': ' + val.text, keyCategory: this.returnKeycategory(val) });
        this.implementFilterChainly();
      }
    }
  }

  onDeleteFilterEvent = (event: any) => {
    this.implementFilterChainly();
  }

  onTableDataLoaded = (event: any) => {
    this.originalParamTableData = event.data;
  }

  implementFilterChainly = () => {
    if (this.projectFilters.length > 0) {
      let arr: any[] = [];
      this.projectFilters.forEach((item: any) => {
        arr = [...arr, ...this.implementFilter(item)];
      });
      this.paramTableData = Array.from(new Set(arr));
    } else {
      this.paramTableData = this.originalParamTableData;
    }
  }

  implementFilter = (filter: any) => {
    const filterCases: any = this.getFilterFromObj(filter);
    if (filterCases && filterCases.arr.length > 0) {
      return this.originalParamTableData.filter((item: any) => {
        let resultCondition: boolean = true;
        if (filterCases.type === 'and') {
          resultCondition = true;
        } else
          if (filterCases.type === 'or') {
            resultCondition = false;
          }

        filterCases.arr.forEach((condition: any) => {
          if (filterCases.type === 'and') {
            resultCondition &&= this.dynamicCondition(condition, item);
          } else
            if (filterCases.type === 'or') {
              resultCondition ||= this.dynamicCondition(condition, item);
            }

        });
        return resultCondition
      });
    } else {
      return [];
    }

  }

  dynamicCondition = (val: any, item: any) => {
    return item[val.key] === val.value;
  }

  getFilterFromObj = (filter: any) => {
    if (filter.text === 'Overdue' && filter.category === 'TB Upload') {
      return {
        type: 'and', arr: [{ key: 'overdue', value: true },
        { key: 'status', value: filter.keyCategory }]
      }
    } else
      if (filter.text === 'Overdue' && filter.category === 'FS Review') {
        return {
          type: 'and', arr: [{ key: 'overdue', value: true },
          { key: 'status', value: filter.keyCategory }]
        }
      } else
        if (filter.text === 'In Progress' && filter.category === 'TB Upload') {
          return { type: 'and', arr: [{ key: 'status', value: 'TBUpload' }] }
        } else
          if (filter.text === 'In Progress' && filter.category === 'FS Review') {
            return { type: 'and', arr: [{ key: 'status', value: 'FSReview' }] }
          } else
            if (filter.text === 'Completed' && filter.category === 'TB Upload') {
              return {
                type: 'or', arr: [{ key: 'status', value: 'FSReview' },
                { key: 'status', value: 'Completed' }]
              }
            } else
              if (filter.text === 'Completed' && filter.category === 'FS Review') {
                return { type: 'and', arr: [{ key: 'status', value: 'Completed' }] }
              } else
                if (filter.text === 'Not Started' && filter.category === 'FS Review') {
                  return {
                    type: 'or', arr: [{ key: 'status', value: 'New' },
                    { key: 'status', value: 'ConfigureFS' },
                    { key: 'status', value: 'TBUpload' }]
                  }
                } else
                  if (filter.text === 'Not Started' && filter.category === 'TB Upload') {
                    return {
                      type: 'or', arr: [{ key: 'status', value: 'New' },
                      { key: 'status', value: 'ConfigureFS' }]
                    }
                  } else {
                    return null;
                  }
  }

  returnKeycategory = (val: any) => {
    if (val) {
      if (val.category === 'TB Upload') {
        return 'TBUpload';
      } else
        if (val.category === 'FS Review') {
          return 'FSReview';
        } else {
          return null;
        }
    } else {
      return null;
    }
  }
}
