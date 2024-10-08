import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {Subject, take, takeUntil, tap} from 'rxjs';
import {EntityService} from 'src/app/@core/services/entity/entity.service';
import {DropFileDialogComponent} from 'src/app/shared/components/drop-file-dialog/drop-file-dialog.component';
import {ActivityCodes, EntityType, FSBConstants} from 'src/app/shared/Infrastructure/constants/constants';
import {ToastrService} from '../../@core/services/shared/toastr/toastr.service';
import {EngagementService} from '../../@core/services/entity/engagement.service';
import {IEngagement, IEntity} from 'src/app/@core/models/entityScreen/entityScreenModel.interface';
import { ActivityService } from 'src/app/@core/services/activity/activity.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EntityComponent implements OnInit {

  public downloading = false;
  public uploading = false;
  public entityType = EntityType
  public engagementMap: any = [];
  public Engagements: any[] = [];
  private Entities: any[] = [];
  public loadingEntities: boolean = false;
  public loadingEngagement: boolean = false;
  private readonly unSubscribe$ = new Subject<void>();

  constructor(
    private entityService: EntityService,
    private engService: EngagementService,
    private dialogService: NbDialogService,
    private activityService: ActivityService,
    private toastr: ToastrService) {
  }

  //#region  Lyfecicle Hooks
  ngOnInit(): void {
    this.loadEngagementAndEntity();
  }

  //#endregion

  downloadTemplate() {
    this.downloading = true;
    this.entityService.getTemplate()
      .pipe(
        take(1),
        tap({error: () => {
          this.downloading = false
          this.toastr.showError(`Template downloaded caused error!`)
        }})
      ).subscribe(file => {
      const url = window.URL.createObjectURL(new Blob([file], {type: file.type}));
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'Entity_Template.xlsx');
      a.click();
      this.toastr.showSuccess(`Template downloaded successfully.`)
      const log: any = {
        "actionType": ActivityCodes.Download,
        "activityTitle": FSBConstants.ActivityList.DownloadEngagementEntity.activity,
        "activityDescription": FSBConstants.ActivityList.DownloadEngagementEntity.description,
        "moduleId": 'ED3B62FF-E7B8-4122-8E3B-5E0E6F104F17'
      }
      this.activityService.saveActivityLog(log).subscribe(result => {
      })
      window.URL.revokeObjectURL(url);
      this.downloading = false
    })
  }

  openDialog() {
    this.dialogService.open(DropFileDialogComponent, {
      context: {
        title: 'Template',
        extensionsAllowed: ".xls,.xlsx"
      },
      closeOnBackdropClick: false
    }).onClose.subscribe(filesResponse => {
      if (filesResponse.upload === true) {
        this.toastr.showInfo('Uploading file... system will show a notification with status progress')
        this.entityService.uploadTemplate(filesResponse.formData)
          .subscribe(response => {
            const rows = response.body;
            if (rows > 0) {
              this.toastr.showSuccess(`File updated successfully, ${rows} rows added.`)
              this.getLists();
            } else {
              this.toastr.showError(`An error has ocurred, please refresh the page.`)
            }
          })
      }
    })
  }

  getLists() {
    this.entityService.getList()
      .pipe(take(1))
      .subscribe(list => {
        if (list.length > 0) {
          this.entityService.items.next(list);
        }
      });

    this.engService.getList()
      .pipe(take(1))
      .subscribe(list => {
        if (list.length > 0) {
          this.engService.items.next(list);
        }
      });
  }

  setEntitiesMap = () => {
    if (this.Engagements && this.Entities) {
      this.engagementMap = [];
      let copyEntities = [...this.Entities];
      this.Engagements.forEach(item => {
        if (item.deleted === false) {
          item.entities = [];
          this.Entities.filter(entity => {
            if (entity.engagementId === item.id) {
              item.entities.push(entity);
              copyEntities.splice(copyEntities.indexOf(entity), 1);
            }
          });
          this.engagementMap.push(item);
        }
      });
      if(copyEntities.length > 0){
        let emptyEngagement: IEngagement = {id: '-', name: '', active: false, isOstensible: true, entities: [...copyEntities]};
        this.engagementMap.push(emptyEngagement);
      }
    }
  }

  loadEngagementAndEntity() {
    this.engService.items
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(items => {
        if (items.length > 0) this.Engagements = items;
        else this.Engagements = this.getEngagements();
        this.entityService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            if (items.length > 0) this.Entities = items;
            else {
              this.Entities = this.getEntities();
            }
            this.setEntitiesMap();
          })
      })
  }

  getEngagements(): IEngagement[] {
    this.loadingEngagement = true;
    let result: IEngagement[] = [];
    this.engService.getList()
      .pipe(tap({
        error: () => this.loadingEngagement = false,
      }))
      .subscribe(list => {
        this.loadingEngagement = false;

        if (list) {
          if (list.length > 0) {
            result = list;
            this.engService.items.next(result);
          }
        }
      });
    return result;
  }

  getEntities(): IEntity[] {
    this.loadingEntities = true;
    let result: IEntity[] = [];
    this.entityService.getList()
      .pipe(tap({
        error: () => this.loadingEntities = false,
      }))
      .subscribe(list => {
        this.loadingEntities = false;
        if (list.length > 0) {
          result = list;
          this.entityService.items.next(result);
        }
      });
    return result;
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
