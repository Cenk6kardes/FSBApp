import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { IProjects } from '../interfaces/projects.interface';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public loading = false;
  public projectName: string = "";
  private readonly unSubscribe$ = new Subject<void>();
  constructor(private _dashService: DashboardService, private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this._route.params.subscribe((params: Params) => {
      this.getProject(params['id']);
    });
  }

  getProject(id: string) {
    this.loading = true;
    this._dashService.getProjectById(id)
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () => {
            this.loading = false
          }
        })
      )
      .subscribe(project => {
        this._dashService.projectDetails.next(project);
        this._dashService.pd.next(project);
        this.projectName = project.name;
        this.loading = false;
      })
  }

}
