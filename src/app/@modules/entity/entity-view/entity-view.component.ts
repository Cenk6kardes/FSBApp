import {
  Component,
  Input,
  OnInit,
  ViewChild,
  SimpleChanges, OnChanges
} from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { Observable, tap, lastValueFrom, take, Subject, takeUntil } from 'rxjs';
import { IEntityScreenModel } from 'src/app/@core/models/entityScreen/entityScreenModel.interface';
import { EngagementService } from 'src/app/@core/services/entity/engagement.service';
import { EntityService } from 'src/app/@core/services/entity/entity.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { EntityType, FSBConstants, NotificationType, OperationType } from 'src/app/shared/Infrastructure/constants/constants';
import { AddEntityComponent } from '../add-entity/add-entity.component';
import { IEngagement, IEntity } from '../../../@core/models/entityScreen/entityScreenModel.interface';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { INotificationSystemGenerting } from 'src/app/@core/models/notification/notifications-widgets-model';
import { LoggerService } from 'src/app/@core/services/shared/logger/logger.service';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { NbAccessChecker } from '@nebular/security';
import { OnDestroy } from '@angular/core';


@Component({
  selector: 'app-entity-view',
  templateUrl: './entity-view.component.html',
  styleUrls: ['./entity-view.component.scss'],
})
export class EntityViewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() idSelected: Observable<string> = new Observable<string>();
  @Input() engagementMap: any;
  private dialogRef: NbDialogRef<any>;
  protected operationType = OperationType;
  public data: IEntityScreenModel[] = [];
  public entityTitle: string = 'Entity';
  public engagementTitle: string = 'Engagement';
  public entityType: EntityType = 2;
  public engagementType: EntityType = 1;
  public copyEngagementMap: any;
  public _engagementMap: any;
  entityInput: string = '';
  engagementInput: string = '';
  sortDesc: boolean;
  iconSort: string = 'chevron-up-outline';
  loading: boolean = false;
  public typeSelect = EntityType;
  public currentDate: Date;
  engCoa: any;
  engCoaList = false;
  public isGranted: boolean;

  projectList: { name: string, entity: any }[] = [];

  @ViewChild('entityList') entitySelectionList: MatSelectionList;

  private readonly unSubscribe$ = new Subject<void>();
  constructor(private dialogService: NbDialogService,
    private toastr: ToastrService,
    private engService: EngagementService,
    private engCoaService: EngagementCoaService,
    private dashService: DashboardService,
    private entityService: EntityService,
    private notificationsServices: NotificationsServices,
    private logger: LoggerService,
    private accessChecker: NbAccessChecker) {
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
  ngOnInit(): void {
    this.currentDate = new Date();
    this.getAuthorization();
    this.getEngagementCoa();
    this.getAllProject();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['engagementMap']) {
      this._engagementMap = changes['engagementMap'].currentValue;
      this.copyEngagementMap = [...this._engagementMap];
      this.sortByAsc(1);
      this.sortByAsc(2);
    }
  }

  getAuthorization() {
    this.accessChecker.isGranted('create', 'engagementAndEntity')
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(granted => {
          this.isGranted = granted;
      })
  }

  filter(field: string, event: Event | any) {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;

    if (field === 'entityName') {
      this.engagementInput = '';
      this.entityInput = value;
      this._engagementMap = this.copyEngagementMap.map((element) => {
        return {
          ...element,
          entities: element.entities.filter((entity) => entity.name.toLocaleLowerCase().includes(this.entityInput.toLocaleLowerCase()))
        }
      }).filter((item: any) => {
        return (item.entities.length > 0);
      });
    }

    if (field === 'engagementName') {
      this.entityInput = '';
      this.engagementInput = value;
      this._engagementMap = [...this.copyEngagementMap].filter((item: any) => {
        return (
          item.name.toLocaleLowerCase().includes(this.engagementInput.toLocaleLowerCase())
        );
      });
    }

  }

  sortByAsc(type: EntityType) {
    switch (type) {
      case EntityType.Engagement:
        this._engagementMap = [
          ...this._engagementMap.sort((a, b) => {
            const engA = a.name.toLowerCase();
            const engB = b.name.toLowerCase();
            return engA ? engA.localeCompare(engB) : 1;
          }),
        ];
        break;
      case EntityType.Entity:
        this._engagementMap = [...this._engagementMap.filter(engagement => {
          engagement.entities.sort((a, b) => {
            const entityA = a.name.toLowerCase();
            const entityB = b.name.toLowerCase();
            return entityA ? entityA.localeCompare(entityB) : 1;
          });
          return engagement;
        })];
        break;
    }
  }

  sortByDesc(type: EntityType) {
    switch (type) {
      case EntityType.Engagement:
        this._engagementMap = [
          ...this._engagementMap.sort((a, b) => {
            const engA = a.name.toLowerCase();
            const engB = b.name.toLowerCase();
            return engB.localeCompare(engA);
          }),
        ];
        break;
      case EntityType.Entity:
        this._engagementMap = [...this._engagementMap.filter(engagement => {
          engagement.entities.sort((a, b) => {
            const entityA = a.name.toLowerCase();
            const entityB = b.name.toLowerCase();
            return entityB.localeCompare(entityA);
          });
          return engagement;
        })];
        break;
    }
  }

  toggleStatus(status: boolean, item: any, entityId?: string) {
    const element = entityId ? this.getEntities(item).find(entity => entity.id == entityId) : this._engagementMap.find(eng => eng.id == item.id);
    let finalType = entityId ? this.entityType : this.engagementType;

    switch (finalType) {
      case EntityType.Engagement:
        this.engService.toggleStatus(element!).subscribe(result => {
          if (result) {
            element!.active = status;
            const label = element?.active ? 'Activated' : 'Deactivated';
            this.toastr.showSuccess(`${label} successfully`);
          }
        });
        break;
      case EntityType.Entity:
        this.entityService.toggleStatus(element!).subscribe(result => {
          if (result) {
            element!.active = status;
            const label = element?.active ? 'Activated' : 'Deactivated';
            this.toastr.showSuccess(`${label} successfully`);
          }
        });
        break;
    }
  }

  openDialog(operation: OperationType, entity: boolean, item?: IEntityScreenModel): void {
    let finalTitle = entity ? this.entityTitle : this.engagementTitle;
    let finalType = entity ? this.entityType : this.engagementType;
    let headerLabel = '';
    switch (operation) {
      case OperationType.Add:
        headerLabel = `Add ${finalTitle}`;
        break;
      case OperationType.Update:
        headerLabel = `Edit ${finalTitle}`;
        break;
      case OperationType.Duplicate:
        headerLabel = `Duplicate ${finalTitle}: ${item?.name}`;
        break;
      case OperationType.Delete:
        headerLabel = `Delete ${finalTitle}: ${item?.name}`;
        this.dialogRef = this.dialogService.open(DeleteDialogComponent, {
          context: {
            title: headerLabel,
            item: item,
            entities: EntityType.Engagement === finalType ? this.getEntities(item) : undefined,
            engCoa: EntityType.Engagement === finalType ? this.getEngagementCoaById(item) : undefined,
            projects: EntityType.Engagement === finalType ? this.getProjectsForEng(item) : this.getProjectsForEnt(item)
          },
          closeOnBackdropClick: false
        });
        this.dialogRef.componentRef.instance.delete.subscribe(deleted => {
          if (deleted === true)
            this.delete(item?.id!, this.dialogRef, entity, item!.name)
        })
        return;
      default:
        return;
    }
    this.dialogService.open(AddEntityComponent, {
      context: {
        title: headerLabel,
        itemEdit: item,
        type: finalType,
        modalType: operation,
      },
      closeOnBackdropClick: false,
    });
    this.entityInput = '';
    this.engagementInput = '';
  }

  async deleteAssociatedEntities(entities: any) {
    let result;
    for (const entity of entities) {
      result = await lastValueFrom(this.entityService.delete(entity.id));
    }
    let newEntities: any[] = [];
    this.entityService.items.subscribe(currentEntities => {
      entities.forEach(entity => {
        currentEntities = currentEntities.filter((obj) => {
          return obj.id !== entity.id;
        })
        newEntities = currentEntities;
      });
    });
    this.entityService.items.next(newEntities);
    return result;
  }

  delete(id: string, deleteDialogRef: NbDialogRef<any>, entity: boolean, name: string) {
    let finalType = entity ? this.entityType : this.engagementType;
    deleteDialogRef.componentRef.instance.loading = true;
    var message = "";
    switch (finalType) {
      case EntityType.Engagement:
        let entities = this.engagementMap.find(x => x.id === id).entities;
        message = FSBConstants.NotificationWidgetsMessages.EngagementDeleted.replace('{0}', name);
        var notificationsrequest = {
          message: message,
          id: id
        } as INotificationSystemGenerting;
        this.notificationsServices.postNotificationByEngagement(notificationsrequest)
          .pipe(tap({
            error: () => {
              this.logger.error(`${message}' Notification to save with issues to Engagement Id:' ${id}`,)
              deleteDialogRef.componentRef.instance.loading = this.deleteEngagementAction(id, entities);
              deleteDialogRef.close();
            }
          }))
          .subscribe(res => {
            deleteDialogRef.componentRef.instance.loading = this.deleteEngagementAction(id, entities);
            deleteDialogRef.close();
          });


        break;
      case EntityType.Entity:

        message = FSBConstants.NotificationWidgetsMessages.EntityDeleted.replace('{0}', name);
        var notification = {
          message: message,
          id: id
        } as INotificationSystemGenerting;
        this.notificationsServices.postNotificationByEntity(notification)
          .pipe(tap({
            error: () => {
              this.logger.error(`${message}' Notification to save with issues to Entity Id:' ${id}`,)
              deleteDialogRef.componentRef.instance.loading = this.deleteEntityAction(id);
              deleteDialogRef.close();
            }
          }))
          .subscribe(res => {
            deleteDialogRef.componentRef.instance.loading = this.deleteEntityAction(id);
            deleteDialogRef.close();
          })
        break;
    }
  }

  async deleteEngagementAction(id, entities): Promise<Boolean> {
    var res = false;
    this.loading = true;
    await this.deleteAssociatedEntities(entities);
    this.engService.delete(id)
      .pipe(tap({
        error: () => {
          res = false,
          this.loading = false;
        }
      }))
      .subscribe(async deleted => {
        if (deleted) {
          this.loading = false;
          res = false
          this.engService.items.next([])
          this.toastr.showSuccess("Engagement and associated entities are deleted!")
        }
      });
    return res;
  }

  deleteEntityAction(id): Boolean {
    var res = false;
    this.loading = true;
    this.entityService.delete(id)
      .pipe(tap({
        error: () => {
          res = false;
          this.loading = false;
         }
      }))
      .subscribe(deleted => {
        if (deleted) {
          this.loading = false;
          this.entityService.items.next([])
          this.toastr.showSuccess("Entity deleted!");
          res = false;
        }
      });
    return res;
  }

  getHeight = (obj: any) => {
    const pixel = 49;
    if (obj.entities.length <= 1) {
      return pixel + 'px';
    } else {
      return obj.entities.length * pixel + 'px';
    }
  }

  getEntities = (val: any) => {
    return val.entities;
  }

  getEngagementCoa = () => {
    this.engCoaService.getList()
      .pipe(take(1))
      .subscribe(
        val => { this.engCoa = val; this.engCoaList = true }
      );
  }

  getEngagementCoaById = (item) => {
    return this.engCoa.filter(coa => coa.engagements?.some(eng => { return eng.id == item.id }))
  }

  getAllProject = () => {
    this.dashService.getAllProjects()
      .pipe(take(1))
      .subscribe(projects => {
        if (projects) {
          projects.map(project => this.projectList.push({
            name: project.name,
            entity: project.entity
          }
          ))
        }
      })
  }

  getProjectsForEng = (item) => {
    let eItems: { id: string }[] = [];
    item.entities.map(entity => eItems.push(entity.id))
    return this.projectList.filter(project => eItems.includes(project.entity?.id))
  }

  getProjectsForEnt = (item) => {
    return this.projectList.filter(project => item.id == project.entity?.id)
  }
}
