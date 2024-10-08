import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbDateService, NbDateTimeAdapterService } from '@nebular/theme';
import { debounceTime, defer, distinctUntilChanged, map, merge, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { EntityService } from 'src/app/@core/services/entity/entity.service';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { ICoaModel } from 'src/app/@core/models/library/coa-models';
import { MatStepper } from '@angular/material/stepper';
import { IEntity } from 'src/app/@core/models/entityScreen/entityScreenModel.interface';
import { ICoaType, IPeriodBreak, IProjectType } from 'src/app/@core/models/shared/catalogs/catalogs-model';
import { CatalogService } from 'src/app/@core/services/shared/catalog/catalog.service';
import { IProjectSetup } from '../interfaces/project-setup.interface';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { IProjectTable } from '../interfaces/projects.interface';
import { FSBConstants, NotificationType, ProjectStatus } from 'src/app/shared/Infrastructure/constants/constants';
import { DatePipe } from '@angular/common';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { INotificationSystemGenerting } from 'src/app/@core/models/notification/notifications-widgets-model';
import { LoggerService } from 'src/app/@core/services/shared/logger/logger.service';
@Component({
  selector: 'app-project-setup',
  templateUrl: './project-setup.component.html',
  styleUrls: ['./project-setup.component.scss']
})
export class ProjectSetupComponent implements OnInit, OnDestroy {
  @ViewChild(MatStepper) stepper: MatStepper;

  private readonly unSubscribe$ = new Subject<void>();

  public tableData: IProjectTable[] = [];
  public financialYear: number[] = [];
  public currentDate: Date;
  public periodStartMinDate: Date;
  public periodStartMaxDate: Date;
  public periodEndMinDate: Date;
  public periodEndMaxDate: Date;
  public tbUploadMinDate: Date;
  public tbUploadMaxDate: Date;
  public fsReviewMinDate: Date;
  public fsReviewMaxDate: Date;
  public newProject = new FormGroup({
    step1: new FormGroup({
      entityName: new FormControl<IEntity | null>({ value: null, disabled: false }, Validators.required),
      financialYear: new FormControl<number | null>({ value: null, disabled: false }, Validators.required),
    }),
    step2: new FormGroup({
      periodStartDate: new FormControl<Date | null>({ value: null, disabled: true }, Validators.required),
      periodEndDate: new FormControl<Date | null>({ value: null, disabled: true }, Validators.required),
    }),
    step3: new FormGroup({
      periodBreak: new FormControl<IPeriodBreak | null>({ value: null, disabled: true }, Validators.required),
      projectType: new FormControl<IProjectType | null>({ value: null, disabled: true }, Validators.required),
    }),
    step4: new FormGroup({
      coa: new FormControl<IProjectType | ICoaModel | null>({ value: null, disabled: true }, Validators.required),
    }),
    step5: new FormGroup({
      tbUpload: new FormControl<Date | null>({ value: null, disabled: true }, Validators.required),
      fsReview: new FormControl<Date | null>({ value: null, disabled: true }, Validators.required),
    }),
  });

  public entityList$: Observable<IEntity[]>;
  public filteredOptions$: Observable<any[]>;
  public globalCoaList$: Observable<ICoaModel[]>;
  public engCoaList$: Observable<ICoaModel[]>;
  public periodBreak$: Observable<IPeriodBreak[]>;
  public coaType: ICoaType[];
  public coaTypeDropDown: ICoaType[];
  public projectType$: Observable<IProjectType[]>;
  public createClicked: boolean = false;
  public entityLoading: boolean = true;

  constructor(private router: Router,
    private globalCoaService: GlobalCoaService,
    private entityService: EntityService,
    private engCoaService: EngagementCoaService,
    private catalogService: CatalogService,
    private dashboardService: DashboardService,
    private _datePipe: DatePipe,
    private toastr: ToastrService,
    private dateService: NbDateService<Date>,
    private notificationsServices: NotificationsServices,
    private logger: LoggerService) { }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  ngOnInit(): void {
    this.entityList$ = this.entityService.getList()
      .pipe(map((items) => {
        return items.filter(item => item.active);
      }),
        tap({
          next: () => this.entityLoading = false,
          error: () => this.entityLoading = false
        })
      );
    this.filteredOptions$ = this.entityList$;
    this.globalCoaList$ = this.globalCoaService.getList().pipe(map((items) => {
      return items.filter(item => item.active);
    }));
    this.engCoaList$ = this.engCoaService.getList().pipe(map((items) => {
      return items.filter(item => item.active);
    }));
    this.periodBreak$ = this.catalogService.getPeriodBreak();
    this.catalogService.getCoaType()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(
        val => {
          this.coaType = val;
          this.coaTypeDropDown = val.filter(v => v.name === 'Blank' || v.name === 'Roll Forward');
        }
      );

    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);

    let currentYear = this.currentDate.getFullYear();
    for (let i = 0; i < 7; i++) {
      this.financialYear.push(currentYear - 5 + i);
    }

    this.newProject.get(['step1', 'financialYear'])?.valueChanges.pipe(takeUntil(this.unSubscribe$)).subscribe(
      year => {
        this.periodStartMinDate = this.dateService.createDate(year! - 1, 0, 1);
        this.periodStartMaxDate = this.dateService.createDate(year!, 11, 31);
        this.periodEndMinDate = this.dateService.createDate(year! - 1, 0, 1);
        this.periodEndMaxDate = this.dateService.createDate(year!, 11, 31);
        this.tbUploadMaxDate = this.dateService.createDate(year!, 11, 31);
        this.fsReviewMaxDate = this.dateService.createDate(year!, 11, 31);
        this.stepper.reset();

        this.newProject.patchValue({
          step2: {
            periodStartDate: null,
            periodEndDate: null
          },
          step5: {
            tbUpload: null,
            fsReview: null
          }
        });
      }
    );

    this.newProject.get('step1')?.valueChanges.pipe(takeUntil(this.unSubscribe$)).subscribe(
      (val) => {
        if (val.entityName != null && val.financialYear != null) {
          this.newProject.patchValue({
            step3: {
              projectType: null
            }
          })
          this.setProjectType(val.entityName, val.financialYear);
          this.newProject.get('step2')?.enable();
          this.stepper.steps.get(0)!.completed = true;
          let step = this.stepper.steps.find(step => step.completed === false);
          step?.select();
        }
      }
    );

    this.newProject.get('step2')?.valueChanges.pipe(takeUntil(this.unSubscribe$)).subscribe(
      (val) => {
        if (val.periodStartDate != null && val.periodEndDate != null) {
          this.newProject.get('step3')?.enable();
          this.stepper.steps.get(1)!.completed = true;
          let step = this.stepper.steps.find(step => step.completed === false);
          step?.select();
        }
      }
    );

    this.newProject.get('step3')?.valueChanges.pipe(takeUntil(this.unSubscribe$)).subscribe(
      (val) => {
        if (val.periodBreak != null && val.projectType != null) {
          this.newProject.get('step4')?.enable();
          this.stepper.steps.get(2)!.completed = true;
          let step = this.stepper.steps.find(step => step.completed === false);
          step?.select();
        }
      }
    );

    this.newProject.get('step4')?.valueChanges.pipe(takeUntil(this.unSubscribe$)).subscribe(
      (val) => {
        if (val.coa != null) {
          this.newProject.get('step5')?.enable();
          this.stepper.steps.get(3)!.completed = true;
          let step = this.stepper.steps.find(step => step.completed === false);
          step?.select();
        }
      }
    );
  }

  entityChange(evt) {
    this.engCoaList$ = this.engCoaService.getListByEntity(evt.id).pipe(map((items) => {
      return items.filter(item => item.active);
    }));
  }

  onPeriodStartChange(event: Date) {
    this.periodEndMinDate = this.dateService.clone(event);

    this.tbUploadMaxDate = this.fsReviewMaxDate;
    this.newProject.patchValue({
      step5: {
        tbUpload: null,
        fsReview: null
      }
    });
  }

  onPeriodEndChange(event: Date) {
    this.periodStartMaxDate = this.dateService.clone(event);

    if (event.getTime() < this.currentDate.getTime()) {
      this.tbUploadMinDate = this.currentDate;
      this.fsReviewMinDate = this.currentDate;
    }   
    else {
     this.tbUploadMinDate = this.dateService.createDate(event.getFullYear(), event.getMonth(), event.getDate() + 1);
     this.fsReviewMinDate = this.dateService.createDate(event.getFullYear(), event.getMonth(), event.getDate() + 1);
    } 

    this.tbUploadMaxDate = this.fsReviewMaxDate;
    this.newProject.patchValue({
      step5: {
        tbUpload: null,
        fsReview: null
      }
    });
  }

  onTBUploadChange(event: Date) {
    this.fsReviewMinDate = this.dateService.clone(event);
  }

  onFSReviewChange(event: Date) {
    this.tbUploadMaxDate = this.dateService.clone(event);
  }

  addNewProject() {
    if (this.newProject.valid) {
      let formValue = this.newProject.value;
      let coaTypeId = "";
      let globalCoaId: string | null = null;
      let engagementCoaId: string | null = null;

      if (formValue.step4!.coa!.hasOwnProperty('code')) {
        coaTypeId = this.coaType.find(coa => coa.name === formValue.step4!.coa!.name)!.id;
      } else if (formValue.step4!.coa!.hasOwnProperty('engagements')) {
        coaTypeId = this.coaType.find(coa => coa.name === "Engagement COA")!.id;
        engagementCoaId = formValue.step4!.coa!.id;
      } else {
        coaTypeId = this.coaType.find(coa => coa.name === "Global COA")!.id;
        globalCoaId = formValue.step4!.coa!.id;
      }

      let projectToCreate: IProjectSetup = {
        "id": null,
        "entityId": formValue.step1!.entityName!.id,
        "financialYear": formValue.step1!.financialYear!,
        "name": `${formValue.step1!.entityName!.name}_${formValue.step1!.financialYear!.toString()}`,
        "periodStartDate": this.dashboardService.setDate(formValue.step2!.periodStartDate!),
        "periodEndDate": this.dashboardService.setDate(formValue.step2!.periodEndDate!),
        "periodBreakId": formValue.step3!.periodBreak!.id,
        "projectTypeId": formValue.step3!.projectType!.id,
        "coaTypeId": coaTypeId,
        "globalCoaId": globalCoaId,
        "engagementCoaId": engagementCoaId,
        "uploadDueDate": this.dashboardService.setDate(formValue.step5!.tbUpload!),
        "reviewDueDate": this.dashboardService.setDate(formValue.step5!.fsReview!),
        "status": ProjectStatus.New
      }

      this.createClicked = true;

      this.dashboardService.createProject(projectToCreate)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe({
          next: result => {
            this.dashboardService.projectTable.next([])
            this.toastr.showSuccess('Project successfully created', '');
            this.engCoaService.items.next([]);
            this.globalCoaService.items.next([]);
            let entities: string[] = []
            entities.push(projectToCreate.entityId);
            let message = FSBConstants.NotificationWidgetsMessages.ProjectAdded.replace('{0}', projectToCreate.name.toString());
            var notificationsrequest = {
              message: message,
              id: result
            } as INotificationSystemGenerting;
            this.notificationsServices.postNotificationByProject(notificationsrequest)
              .pipe(tap({
                error: () => {
                  this.logger.error(`${message}' Notification to save with issues to project Id:' ${result}`,)
                }
              }))
              .subscribe()
            this.router.navigate(['home/dashboard']);
          },
          error: err => {
            this.createClicked = false;
            this.toastr.showError(err);
          }
        });
    } else {
      this.toastr.showError('Fields cannot be empty or invalid', '');
    }
  }

  setProjectType(entityName: IEntity, financialYear: number) {
    this.dashboardService.getHasPreviousYear(entityName, financialYear).pipe(takeUntil(this.unSubscribe$)).subscribe(res => {
      if (res) {
        this.projectType$ = this.catalogService.getProjectType();
      }
      else {
        this.projectType$ = this.catalogService.getProjectType().pipe(map(items => items.filter(item => item.name === 'Blank')));
      }
    })
  }

  cancel() {
    this.router.navigate(['home/dashboard']);
  }
  viewHandle(value: any) {
    return value?.name ? value?.name : value;
  }

  private filter(value: string) {
    const filterValue = value.toLowerCase();
    if (filterValue) {
      return this.entityService.list
        .pipe(
          map(val => {
            let filteredValues = val?.filter(a => { return a.name?.toLowerCase().includes(value?.toLowerCase()) }).map(p => { return { name: p.name, id: p.id } });
            if (filteredValues.length > 0) {
              return filteredValues;
            } else {
              return [{ name: "No results found", id: "-1" }];
            }
          })
        );
    }
    return this.entityService.list;
  }

  getFilteredOptions(value: string): Observable<any> {
    return of(value).pipe(
      map(filterString => this.filter(filterString)),
    );
  }

  onChange(value: any) {
    const searchString$ = merge(
      defer(() => of(value.target.value))
    ).pipe(
      debounceTime(500),
      distinctUntilChanged(),
    );
    this.filteredOptions$ = searchString$.pipe(switchMap((searchString: string) =>
      this.filter(searchString)
    ),)
  }

}
