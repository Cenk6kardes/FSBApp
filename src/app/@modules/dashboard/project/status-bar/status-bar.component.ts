import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Subject, take, takeUntil, tap } from 'rxjs';
import { INotificationSystemGenerting } from 'src/app/@core/models/notification/notifications-widgets-model';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { LoggerService } from 'src/app/@core/services/shared/logger/logger.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { StatusChangeDialogComponent } from 'src/app/shared/components/status-change-dialog/status-change-dialog.component';
import { FSBConstants, NotificationType, ProjectStatus } from 'src/app/shared/Infrastructure/constants/constants';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent implements OnInit {

  private readonly unSubscribe$ = new Subject<void>();

  public status = ProjectStatus.TBUpload;
  public project: any;
  public dialogBody: string = "";

  public statusBars = [
    { label: "New", clickable: false, done: false, className: "statusNewOngoing" },
    { label: "Configure FS", clickable: true, done: false, className: "" },
    { label: "TB Upload", clickable: false, done: false, className: "" },
    { label: "FS Review", clickable: false, done: false, className: "" },
    { label: "Completed", clickable: false, done: false, className: "" }
  ];

  constructor(protected dashboardService: DashboardService, private toastr: ToastrService, private dialogService: NbDialogService,
    protected notificationsServices: NotificationsServices, private logger: LoggerService) { }

  ngOnInit(): void {
    this.initStatus();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  initStatus() {
    this.dashboardService.projectDetails
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(project => {
        this.project = project;
        this.setStatus(project.status);
      });
  }

  onChangeStatus(stat: string) {
    if(!this.project) {
      this.toastr.showError("Project is null");
      return;
    }
    
    let newStatus = stat.split(' ').join('');
    let newStatusIndex = Object.keys(ProjectStatus).indexOf(newStatus);
    this.dialogBody = "";

    if(newStatusIndex === Object.keys(ProjectStatus).indexOf(ProjectStatus.Completed)) {
      this.dialogBody = `Are you sure you want to mark the project status as ${stat}? Once changed, system will not allow any changes on the project.`;
    } else {
      this.dialogBody = `Are you sure you want to mark the project status as ${stat}?`;
    }

    this.dialogService.open(StatusChangeDialogComponent, {
      context: {
        title: 'Status Change',
        body: this.dialogBody
      },
      closeOnBackdropClick: false
    })
    .onClose.subscribe((data) => {
      if (data.confirm) {
        this.dashboardService.changeStatus(this.project, newStatus)
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe({
            next: result => {
              this.toastr.showSuccess('Status successfully changed', '');
              if (newStatus == ProjectStatus.Completed){
                let message = FSBConstants.NotificationWidgetsMessages.ProjectLocked.replace('{0}', this.project.name.toString());
                var notifications = {
                  message: message,
                  id: this.project.id
                } as INotificationSystemGenerting
                this.notificationsServices.postNotificationByProject(notifications)
                .pipe(tap({
                  error: () => {
                    this.logger.error(`${message}' Notification to save with issues to project Id:' ${this.project.id}`,)
                  }
                }))
                .subscribe()
              }
            },
            error: err => {
              this.toastr.showError(err);
            }
          });
      }
    });
  }

  setStatus(stat: string) {
    switch(stat) {
      case ProjectStatus.New:
        this.statusBars = [
          { label: "New", clickable: false, done: false, className: "statusNewOngoing" },
          { label: "Configure FS", clickable: true, done: false, className: "" },
          { label: "TB Upload", clickable: true, done: false, className: "" },
          { label: "FS Review", clickable: true, done: false, className: "" },
          { label: "Completed", clickable: true, done: false, className: "" }
        ];
        break;
      case ProjectStatus.ConfigureFS:
        this.statusBars = [
          { label: "New", clickable: true, done: true, className: "statusNewDone" },
          { label: "Configure FS", clickable: false, done: false, className: "statusConfigureFSOngoing" },
          { label: "TB Upload", clickable: true, done: false, className: "" },
          { label: "FS Review", clickable: true, done: false, className: "" },
          { label: "Completed", clickable: true, done: false, className: "" }
        ];
        break;
      case ProjectStatus.TBUpload:
        this.statusBars = [
          { label: "New", clickable: true, done: true, className: "statusNewDone" },
          { label: "Configure FS", clickable: true, done: true, className: "statusConfigureFSDone" },
          { label: "TB Upload", clickable: false, done: false, className: "statusTBUploadOngoing" },
          { label: "FS Review", clickable: true, done: false, className: "" },
          { label: "Completed", clickable: true, done: false, className: "" }
        ];
        break;
      case ProjectStatus.FSReview:
        this.statusBars = [
          { label: "New", clickable: true, done: true, className: "statusNewDone" },
          { label: "Configure FS", clickable: true, done: true, className: "statusConfigureFSDone" },
          { label: "TB Upload", clickable: true, done: true, className: "statusTBUploadDone" },
          { label: "FS Review", clickable: false, done: false, className: "statusFSReviewOngoing" },
          { label: "Completed", clickable: true, done: false, className: "" }
        ];
        break;
      case ProjectStatus.Completed:
        this.statusBars = [
          { label: "New", clickable: false, done: true, className: "statusNewDone" },
          { label: "Configure FS", clickable: false, done: true, className: "statusConfigureFSDone" },
          { label: "TB Upload", clickable: false, done: true, className: "statusTBUploadDone" },
          { label: "FS Review", clickable: false, done: true, className: "statusFSReviewDone" },
          { label: "Completed", clickable: false, done: true, className: "statusCompletedDone" }
        ];
        break;
    }
  }
}
