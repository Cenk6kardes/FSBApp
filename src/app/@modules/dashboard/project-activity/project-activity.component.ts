import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { ActivityService } from 'src/app/@core/services/activity/activity.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';

@Component({
  selector: 'app-project-activity',
  templateUrl: './project-activity.component.html',
  styleUrls: ['./project-activity.component.scss']
})
export class ProjectActivityComponent implements OnInit {
  private readonly unSubscribe$ = new Subject<void>();
  loading: boolean = false;

  constructor(protected activityService: ActivityService, private toastr: ToastrService) { }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  ngOnInit(): void {
    this.initMyActivities();
  }

  initMyActivities() {
    this.loading = true;
    this.activityService.getAllActivityLog()
      .pipe(takeUntil(this.unSubscribe$), 
        tap({
          error: () => {
            this.toastr.showError('An errror ocurrs');
            this.loading = false;
          }
        }))
      .subscribe(activities => {
        this.activityService.setUserActivityLog(activities);
        this.loading = false;
      });
  }
}
