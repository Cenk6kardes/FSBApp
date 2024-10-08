import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DefaultConfig, Pagination } from "ngx-easy-table";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Config } from 'ngx-easy-table';
import { forkJoin, Subject, takeUntil, tap } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { ProjectDashboardService } from 'src/app/@core/services/project-dashboard/project-dashboard.service';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit {

  teamMembers: any[] = [];
  columns: any[] = [];
  loadingUsers: boolean = false;
  configuration: Config;
  daysLeftTBUpload: number = 0;
  percentOfTBUploadTime: number = 0;
  daysLeftFSReview: number = 0;
  percentOfFSReviewTime: number = 0;
  projectId: string;
  dashboardTimeWidgetForm = new FormGroup({
    TBUploadDatePicker: new FormControl<Date | null>({ value: null, disabled: false }),
    FsReviewDatePicker: new FormControl<Date | null>({ value: null, disabled: false }),
  })

  tbUploadDate: Date;
  fsReviewDate: Date;

  columnStatus: any;
  data: any[];
  tbUploadProgress: string = "";
  fsReviewProgress: string = "";
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('userTpl', { static: true }) userTpl: TemplateRef<any>;
  @ViewChild('timeTpl', { static: true }) timeTpl: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl: TemplateRef<any>;
  @ViewChild('DescTpl', { static: true }) DescTpl: TemplateRef<any>;
  @ViewChild('FileTpl', { static: true }) FileTpl: TemplateRef<any>;
  public paginationTotalItems: number;
  public pagination: Pagination;

  constructor(private dashboardService: DashboardService,
    private router: Router,
    private projectDashboardService: ProjectDashboardService
  ) {
    this.tbUploadProgress = `conic-gradient(#7f59a8, 0deg, #E2E8F0 0deg)`;
    this.fsReviewProgress = 'conic-gradient(#f4b258, 120deg, #E2E8F0 0deg)';
  }

  ngOnInit(): void {
    this.projectId = this.router.url.split('/')[4];
    forkJoin({
      TBUpload: this.projectDashboardService.getTBUpload(this.projectId),
      FSReview: this.projectDashboardService.getFSReview(this.projectId),
      TeamMembers: this.projectDashboardService.getTeamMembers(this.projectId),
      ProjectActivity: this.projectDashboardService.getProjectActivities(this.projectId)
    }).subscribe((data: any) => {
      const TBUpload = data.TBUpload;
      const FSReview = data.FSReview;

      if (TBUpload) {
        this.daysLeftTBUpload = TBUpload.daysLeft;
        this.percentOfTBUploadTime = TBUpload.percentage;
        this.tbUploadProgress = `conic-gradient(#7f59a8, ${this.percentOfTBUploadTime}deg, #E2E8F0 0deg)`;
        let timeZoneDate = new Date(TBUpload.uploadDueDate);
        timeZoneDate.setDate(timeZoneDate.getDate());
        this.dashboardTimeWidgetForm.patchValue({
          TBUploadDatePicker: timeZoneDate
        })
        this.tbUploadDate = new Date(TBUpload.uploadDueDate);
      }

      if (FSReview) {
        this.daysLeftFSReview = FSReview.daysLeft;
        this.percentOfFSReviewTime = FSReview.percentage;
        this.fsReviewProgress = `conic-gradient(#f4b258, ${this.percentOfFSReviewTime}deg, #E2E8F0 0deg)`;

        let timeZoneDate = new Date(FSReview.uploadDueDate);
        timeZoneDate.setDate(timeZoneDate.getDate());
        this.dashboardTimeWidgetForm.patchValue({
          FsReviewDatePicker: timeZoneDate
        })
        this.fsReviewDate = new Date(FSReview.uploadDueDate);
      }

      if (data.TeamMembers) {
        this.teamMembers = data.TeamMembers;
      }

      if (data.ProjectActivity) {
        this.data = data.ProjectActivity;
        this.paginationTotalItems = data.ProjectActivity.length;
      }

    }, (err: any) => {
      console.log(err);
    })

    this.columns = [
      { key: 'userName', title: "Team Member", cellTemplate: this.userTpl, width: '200px' },
      { key: 'createdDate', title: "Date and Time", cellTemplate: this.timeTpl, width: '200px' },
      { key: 'projectStatus', title: "Status", cellTemplate: this.statusTpl, width: '200px' },
      { key: 'activityDescription', title: "Activity Description", cellTemplate: this.DescTpl, width: '500px' },
      { key: 'file', title: "File Attached", cellTemplate: this.FileTpl, width: '300px' }
    ];

    this.dashboardService.completedStatus.subscribe(status => {
      //if (status) {
      this.dashboardTimeWidgetForm.disable();
      //} else {
      //  this.dashboardTimeWidgetForm.enable();
      //}
    })

    this.configuration = { ...DefaultConfig };
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.paginator._intl.itemsPerPageLabel = "Show";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const pageRange = (length == 0) ? `0/0` : `${page + 1}/${Math.ceil(length / pageSize)}`;
      return `${pageRange}`;
    };
  }


  returnProperty = (val: any, property: string) => {
    return val[property];
  }

  onPeriodStartChange = (event: any) => {
  }

  paginationEvent($event: PageEvent): void {
    this.pagination = {
      ...this.pagination,
      limit: $event.pageSize,
      offset: $event.pageIndex + 1,
      count: $event.length,
    };
  }

  getStatusName(name: string) {
    switch (name) {
      case 'ConfigureFS':
        return 'Structure Set Up'
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

  calculateOverdue(date: Date, type?: boolean) {
    let date2 = new Date();
    let date1 = new Date(date);
    let diff = Math.floor((Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) - Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) / (1000 * 60 * 60 * 24))
    if (type) {
      if (diff > 0){
        return false;
      }else{
        return true;
      } 
    }
    return diff
  }
}
