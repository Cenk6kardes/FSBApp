import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ICoaModel } from 'src/app/@core/models/library/coa-models';
import { ICoaType, IPeriodBreak, IProjectType } from 'src/app/@core/models/shared/catalogs/catalogs-model';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { ProjectService } from 'src/app/@core/services/project/project.service';
import { CatalogService } from 'src/app/@core/services/shared/catalog/catalog.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { IProjectSetup } from '../../interfaces/project-setup.interface';
import { IProjects, IEntity } from '../../interfaces/projects.interface';
import { ProjectStatus, TabType } from 'src/app/shared/Infrastructure/constants/constants';
import { BalanceProcessingService } from 'src/app/@core/services/balance-processing/balance-processing.service';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent implements OnInit, OnDestroy {
  public loading = false;
  public settingsForm: FormGroup
  public periodBreak$: Observable<IPeriodBreak[]>;
  public globalCoaList$: ICoaModel[];
  public projectType$: Observable<IProjectType[]>;
  public coaType$: ICoaType[];
  public engCoaList$: ICoaModel[];
  public coaID = '';
  public tbUploadMinDate: Date;
  public tbUploadMaxDate: Date;
  public fsReviewMinDate: Date;
  public fsReviewMaxDate: Date;
  public projectDetail = {} as IProjects;
  public defaultDetail = {} as IProjects;
  public entity: string = '';
  public financialYear: string = '';
  public periodStartDate: string | null = '';
  public periodEndDate: string | null = '';
  public projectType: string = '';
  public projectStatusCompleted: boolean = false;
  public currentDate: Date;
  public formChangeType: number = 0;

  private readonly unSubscribe$ = new Subject<void>();
  constructor(
    private _catalogService: CatalogService,
    private _globalCoaService: GlobalCoaService,
    private _engCoaService: EngagementCoaService,
    private _dialogService: NbDialogService,
    private _toastr: ToastrService,
    private _dashService: DashboardService,
    private _router: Router,
    private _balanceProcessingService: BalanceProcessingService,
    private _dateService: NbDateService<Date>
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.projectType$ = this._catalogService.getProjectType();
    this.periodBreak$ = this._catalogService.getPeriodBreak();
    this._globalCoaService.getList()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(
        val => this.globalCoaList$ = val
      );
    this._catalogService.getCoaType()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(
        val => this.coaType$ = val
      );
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.loadProjectSettings();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.unsubscribe();
  }

  initForm() {
    this.settingsForm = new FormGroup({
      periodBreak: new FormControl<string | null>(null, Validators.required),
      coa: new FormControl<string | null>(null, Validators.required),
      dueDateTb: new FormControl<Date | null>(null, Validators.required),
      dueDateFs: new FormControl<Date | null>(null, Validators.required)
    });
    this._dashService.completedStatus
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(completed => {
        if (completed) {
          this.settingsForm.disable();
          this.projectStatusCompleted = true;
        } else {
          this.settingsForm.enable();
          this.projectStatusCompleted = false;
        }
      });
  }

  loadProjectSettings() {
    this._dashService.projectDetails
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(details => {
        if (details.id) {
          if (details.engagementCoa != null && details.engagementCoa != '') this.coaID = details.engagementCoa;
          else if (details.globalCoa != null && details.globalCoa != '') this.coaID = details.globalCoa;
          else this.coaID = details.coaType.id;

          this.projectDetail = details;
          this.defaultDetail = details;

          let setDueDateTb = new Date(details.uploadDueDate);
          let setDueDateFs = new Date(details.reviewDueDate);
          let periodEndDateToDate = new Date(this.projectDetail.periodEndDate);

          this.settingsForm.patchValue({
            periodBreak: details.periodBreak.id,
            coa: this.coaID,
            dueDateTb: setDueDateTb,
            dueDateFs: setDueDateFs
          });

          if (periodEndDateToDate.getTime() < this.currentDate.getTime()) {
            this.tbUploadMinDate = this.currentDate;
            this.fsReviewMinDate = this.currentDate;
          }
          else {
            this.tbUploadMinDate = this._dateService.createDate(periodEndDateToDate.getFullYear(), periodEndDateToDate.getMonth(), periodEndDateToDate.getDate() + 1);
            this.fsReviewMinDate = this._dateService.createDate(periodEndDateToDate.getFullYear(), periodEndDateToDate.getMonth(), periodEndDateToDate.getDate() + 1);
          }

          this.fsReviewMaxDate = this._dateService.createDate(this.projectDetail.financialYear!, 11, 31);
          this.tbUploadMaxDate = this.fsReviewMaxDate;

          this._engCoaService.getListByEntity(this.projectDetail.entity.id)
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe(
              val => this.engCoaList$ = val
            );
        }
      })
  }

  submitForm() {
    let text: string;
    if (this.formChangeType === 1) {
      text = '<h3>Are you sure you want to update the Due Date?</h3>'
    } else {
      text = "<h3>Are you sure you want to change the Period Break / COA? <br> Once changed, existing data may be lost.</h3>"
    }
    this._dialogService.open(ConfirmDialogComponent, {
      context: {
        title: 'Confirm Changes',
        text: text,
        modalType: 'warning'
      },
    })
      .onClose.subscribe(data => {
        if (data.confirm) {
          this.loading = true;
          let updateProject: IProjectSetup = {
            id: this.projectDetail.id,
            entityId: this.projectDetail.entity.id,
            financialYear: this.projectDetail.financialYear,
            name: this.projectDetail.name,
            periodStartDate: this.projectDetail.periodStartDate,
            periodEndDate: this.projectDetail.periodEndDate,
            periodBreakId: this.settingsForm.value.periodBreak,
            projectTypeId: this.projectDetail.projectType.id,
            coaTypeId: this.projectDetail.coaType.id,
            globalCoaId: this.projectDetail.globalCoa != '' ? this.projectDetail.globalCoa : null,
            engagementCoaId: this.projectDetail.engagementCoa != '' ? this.projectDetail.engagementCoa : null,
            uploadDueDate: this._dashService.setDate(this.settingsForm.value.dueDateTb),
            reviewDueDate: this._dashService.setDate(this.settingsForm.value.dueDateFs),
            status: this.projectDetail.status
          }
          this._dashService.updateProject(updateProject)
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe({
              next: result => {
                this.projectDetail.periodBreak.id = this.settingsForm.value.periodBreak;
                this.projectDetail.uploadDueDate = this.settingsForm.value.dueDateTb.toISOString();
                this.projectDetail.reviewDueDate = this.settingsForm.value.dueDateFs.toISOString();
                this._dashService.projectDetails.next({ ...this.projectDetail });
                this._toastr.showSuccess("Project Updated", '');

                this._dashService.pd.next(this._dashService.projectDetails.value);
                this.periodBreak$.subscribe(val => {
                  val.filter(item => {
                    if (item.id == this.settingsForm.value.periodBreak) this._dashService.periodBreak.next(item.name)
                  })
                })
                this._balanceProcessingService.changeSub.next(TabType.ProjectBalanceSheet);
                this._balanceProcessingService.changeSub.next(TabType.ProjectIncomeStatement);

                this.loading = false;
              },
              error: err => {
                this._toastr.showError("An errror ocurrs", '');
                this.loading = false;
              }
            });
        }
      });

  }

  cancel() {
    this.settingsForm.patchValue({
      periodBreak: this.defaultDetail.periodBreak.id,
      coa: this.coaID,
      dueDateTb: new Date(this.defaultDetail.uploadDueDate),
      dueDateFs: new Date(this.defaultDetail.reviewDueDate)
    });
  }

  optGroupChange(event) {
    if (this.globalCoaList$.find(item => item.id == event)) {
      this.projectDetail.engagementCoa = '';
      this.projectDetail.globalCoa = event
      this.projectDetail.coaType.id = this.coaType$.find(coa => coa.name === "Global COA")!.id;
    }
    else if (this.engCoaList$.find(item => item.id == event)) {
      this.projectDetail.globalCoa = '';
      this.projectDetail.engagementCoa = event
      this.projectDetail.coaType.id = this.coaType$.find(coa => coa.name === "Engagement COA")!.id;
    }
    else {
      this.projectDetail.globalCoa = '';
      this.projectDetail.engagementCoa = '';
      this.projectDetail.coaType.id = event
    }
    this._engCoaService.items.next([]);
    this._globalCoaService.items.next([]);
    this.formChangeType = 0;
  }

  onTBUploadChange(event: Date) {
    this.fsReviewMinDate = this._dateService.clone(event);
    this.formChangeType = 1;
    if (this.fsReviewMinDate.getTime() > this.settingsForm.value.dueDateFs) {
      this.settingsForm.patchValue({
        dueDateFs: null
      });
    }
  }

  onFSReviewChange(event: Date) {
    this.tbUploadMaxDate = this._dateService.clone(event);
    this.formChangeType = 1;
    if (this.tbUploadMaxDate.getTime() < this.settingsForm.value.dueDateTb) {
      this.settingsForm.patchValue({
        dueDateTb: null
      });
    }
  }

  formType() {
    this.formChangeType = 0
  }
}
