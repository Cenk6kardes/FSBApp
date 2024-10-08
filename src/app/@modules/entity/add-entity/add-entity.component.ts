import {Component, Input, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';
import {IEntityScreenModel} from 'src/app/@core/models/entityScreen/entityScreenModel.interface';
import {EntityType,  FSBConstants, NotificationType, OperationType} from 'src/app/shared/Infrastructure/constants/constants';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, of, tap, takeUntil, Subject, take} from 'rxjs';
import {EngagementService} from 'src/app/@core/services/entity/engagement.service';
import {EntityService} from 'src/app/@core/services/entity/entity.service';
import {ToastrService} from 'src/app/@core/services/shared/toastr/toastr.service';
import {IGenericEntity} from 'src/app/@core/models/shared/entity-model';
import {CatalogService} from 'src/app/@core/services/shared/catalog/catalog.service';
import {ToastrMessages} from 'src/app/shared/Infrastructure/Constants/toastr-messages';
import { NotificationsServices } from 'src/app/@core/services/notifications/notification.service';
import { INotificationSystemGenerting } from 'src/app/@core/models/notification/notifications-widgets-model';
import { LoggerService } from 'src/app/@core/services/shared/logger/logger.service';

@Component({
  selector: 'app-add-entity',
  templateUrl: './add-entity.component.html',
  styleUrls: ['./add-entity.component.scss']
})
export class AddEntityComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() itemEdit: any;
  // @Input() engagementEdit: IEntityScreenModel;
  @Input() type: EntityType;
  @Input() modalType: OperationType;
  // @Input() options:IEntityScreenModel[];

  private readonly unSubscribe$ = new Subject<void>();

  public entityType = EntityType;
  public options: IEntityScreenModel[];
  public searchPlHolder = '';
  public isDuplicate = false;
  public loading = false;

  public countries$: Observable<IGenericEntity[]>;
  public currencies$: Observable<IGenericEntity[]>;
  public entityTypes$: Observable<IGenericEntity[]>;
  public industries$: Observable<IGenericEntity[]>;

  public form: FormGroup;
  public currentDate: Date;

  constructor(protected ref: NbDialogRef<AddEntityComponent>,
    private engService: EngagementService,
    private entityService: EntityService,
    private catalogService: CatalogService,
    private toastr: ToastrService,
    private notificationsServices: NotificationsServices,
    private logger: LoggerService) { }

  //#region Lifecycle Hooks
  ngOnInit(): void {
    this.initForm();
    this.initDropDowns();
    this.currentDate = new Date();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  //#endregion

  initForm() {
    this.form = new FormGroup({
      'engagementForm': new FormGroup({
        'name': new FormControl<string>('', [Validators.required, Validators.pattern("^[0-9a-zA-Z ]*$")]),
        // 'name': new FormControl<string>('',  Validators.compose([Validators.required, Validators.pattern("^[0-9a-zA-Z ]*$")])), backwards compatibility
        'entities': new FormControl<string[]>([]),
      }),
      'entityForm': new FormGroup({
        'engagementId': new FormControl(null),
        'ein': new FormControl(null),
        'entityTypeId': new FormControl(null),
        'countryId': new FormControl(null),
        'industryId': new FormControl(null),
        'currencyId': new FormControl(null),
      }),
    });
  }

  initDropDowns() {
    switch (this.type) {
      case EntityType.Engagement: //Load Entities for Engagement
        this.searchPlHolder = 'Entities';
        this.loadEntities();
        break;
      case EntityType.Entity: // Load Engagement for Entity
        this.searchPlHolder = 'Engagement';
        this.loadDropDowns();
        this.loadEngagement();
        break;
    }
  }

  loadDropDowns() {
    this.loadCountries();
    this.loadIndustries();
    this.loadCurrencies();
    this.loadEntityTypes();
  }

  loadIndustries() {
    this.catalogService.getIndustries()
      .pipe(take(1))
      .subscribe(items => this.industries$ = of(items))
  }

  loadEntityTypes() {
    this.catalogService.getEntityTypes()
      .pipe(take(1))
      .subscribe(items => this.entityTypes$ = of(items))
  }

  loadCurrencies() {
    this.catalogService.getCurrencies()
      .pipe(take(1))
      .subscribe(items => this.currencies$ = of(items))
  }

  loadCountries() {
    this.catalogService.getCountries()
      .pipe(take(1))
      .subscribe(items => this.countries$ = of(items))
  }

  loadEngagement() {
    this.engService.items.pipe(take(1))
      .subscribe(engagements => {
        this.options = engagements
      });
    switch (this.modalType) {
      case OperationType.Add: //load all Engagements

        break;
      case OperationType.Update: //load all Engagements - select one if related
        this.form.get('engagementForm')?.patchValue({
          'name': this.itemEdit.name
        })
        this.form.get('entityForm')?.patchValue({
          'engagementId': this.options.find(x => x.id === this.itemEdit.engagementId!)?.id,
          'ein': this.itemEdit.ein,
          'entityTypeId': this.itemEdit.entityTypeId,
          'countryId': this.itemEdit.countryId,
          'industryId': this.itemEdit.industryId,
          'currencyId': this.itemEdit.currencyId,
        });

        break;
    }

  }

  loadEntities() {
    this.entityService.items.pipe(take(1))
      .subscribe(entities => {
        this.options = entities
      });
    switch (this.modalType) {
      case OperationType.Add:  //1. Load all entities
        break;
      case OperationType.Update: //1. Load all entities - select related ones
        this.form.get('engagementForm')?.patchValue({
          'name': this.itemEdit.name,
          'entities': this.options.filter(x => x.engagementId === this.itemEdit.id)
            .map(items => items.id)
        })
        break;
      case OperationType.Duplicate:
        this.isDuplicate = true;
        this.form.get('engagementForm')?.patchValue({
          'name': this.itemEdit.name,
          'entities': this.options.filter(x => x.engagementId === this.itemEdit.id)
            .map(items => items.id)
        });

        this.form.get('engagementForm.name')?.valueChanges
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(value => {
            this.isDuplicate = value.trim() === this.itemEdit.name ? true : false;
          })

        break;

    }
  }


  close() {
    this.loading = false;
    this.ref.close();
  }

  onSave() {
    this.loading = true;
    switch (this.modalType) {
      case OperationType.Add:
        this.add();
        break;
      case OperationType.Update:
        this.update();
        break;
      case OperationType.Duplicate:
        break;
    }
  }

  add() {
    const engagement = this.form.get('engagementForm')?.value;
    if (this.isDuplicatedEntry()) return;
    switch (this.type) {
      case EntityType.Engagement:
        this.engService.post(engagement)
          .pipe(tap({
            error: () => this.loading = false,
          }))
          .subscribe(id => {
            if (this.engService.isValidGUID(id)) {
              // this.engService.addItemUI({ id: id, name: engagement?.name!, active: true });
              this.engService.items.next([]);
              this.toastr.showSuccess(`Engagement added successfully`);
              var message = FSBConstants.NotificationWidgetsMessages.EngagementAdded.replace('{0}', engagement.name);
              var notificationsrequest = {
                message: message,
                id: id
              } as INotificationSystemGenerting;
              this.notificationsServices.postNotificationByEngagement(notificationsrequest)
              .pipe(tap({
                error: () => {
                  this.logger.error(`${message}' Notification to save with issues to Engagement Id:' ${id}`,)
                }
              }))
              .subscribe()
              this.entityService.items.next([]);
              this.close();
            }
          });
        break;
      case EntityType.Entity:
        const entity = this.form.get('entityForm')?.value;
        this.entityService.post({name: engagement.name, ...entity})
          .pipe(tap({
            error: () => this.loading = false,
          }))
          .subscribe(id => {
            if (this.entityService.isValidGUID(id)) {
              // this.entityService.addItemUI({ id: id, name: engagement?.name!, active: true });

              this.toastr.showSuccess(`Entity added successfully`);
              var message = FSBConstants.NotificationWidgetsMessages.EntityAdded.replace('{0}',engagement.name);
              var notificationsrequest = {
                id: id,
                message: message
              } as INotificationSystemGenerting;
              this.notificationsServices.postNotificationByEntity(notificationsrequest)
              .pipe(tap({
                error: () => {
                  this.logger.error(`${message}' Notification to save with issues to Entity Id:' ${id}`,)
                  this.entityService.items.next([]);
                }
              }))
              .subscribe()
              this.entityService.items.next([]);
              this.close();
            }
          });
        break;
    }
  }


  update() {
    switch (this.type) {
      case EntityType.Engagement:
        const engagementForm = this.form.get('engagementForm')?.value;
        const engagement = {
          id: this.itemEdit.id,
          active: this.itemEdit.active,
          ...engagementForm
        };
        this.engService.update(engagement)
          .pipe(tap({
            error: () => this.loading = false,
          }))
          .subscribe(success => {
            if (success) {
              this.engService.items.next([]);
              this.entityService.items.next([]);
              this.toastr.showSuccess(`Engagement updated successfully`);
              this.close();
            }
          });
        break;
      case EntityType.Entity:
        const entityForm = this.form.get('entityForm')?.value;
        const name = this.form.get('engagementForm.name')?.value;
        const entity = {
          id: this.itemEdit.id,
          name: name,
          active: this.itemEdit.active,
          ...entityForm
        };
        this.entityService.update(entity)
          .pipe(tap({
            error: () => this.loading = false,
          }))
          .subscribe(success => {
            if (success) {
              this.entityService.items.next([]);
              this.toastr.showSuccess(`Engagement updated successfully`);
              this.close();
            }
          });
        break;
    }
  }

  duplicate() {
    switch (this.type) {
      case EntityType.Engagement:
        const engagementForm = this.form.get('engagementForm')?.value;
        const engagement = {id: this.itemEdit.id, active: this.itemEdit.active, ...engagementForm};
        this.engService.post(engagement)
          .pipe(tap({
            error: () => this.loading = false,
          }))
          .subscribe(id => {
            // this.engService.addItemUI({ id: id, name: engagement?.name!, active: true });
            this.entityService.items.next([]);
            this.toastr.showSuccess(`Engagement duplicated successfully`);
            this.close();
          });
        break;
    }
  }

  /**
   * Validates if name that will be posted already exists either on Engagement or entity list
   * @return {boolean} true: if is a duplicated entry. false: not duplicated entry
   */
  isDuplicatedEntry(): boolean {
    let duplicated = false;
    const name: string = this.form.get('engagementForm.name')?.value;
    switch (this.type) {
      case this.entityType.Engagement:
        this.engService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            if (items.find(x => x.name.trim().toLowerCase() === name.trim().toLowerCase())) {
              this.toastr.showWarning(ToastrMessages.duplicated);
              duplicated = true;
              this.loading = false;
            }
          })
        break;
      case this.entityType.Entity:
        this.entityService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            if (items.find(x => x.name.trim().toLowerCase() === name.trim().toLowerCase())) {
              this.toastr.showWarning(ToastrMessages.duplicated);
              duplicated = true;
              this.loading = false;
            }
          })
        break;
    }
    return duplicated;
  }

}
