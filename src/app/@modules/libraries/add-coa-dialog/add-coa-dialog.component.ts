import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { NbComponentSize, NbDialogRef } from '@nebular/theme';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { ICoaModel } from '../../../@core/models/library/coa-models';
import { CoaType, OperationType, FSBConstants } from '../../../shared/Infrastructure/constants/constants';
import { map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { IEntityScreenModel } from '../../../@core/models/entityScreen/entityScreenModel.interface';
import { EngagementService } from '../../../@core/services/entity/engagement.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from '../../../@core/services/shared/toastr/toastr.service';
import { ToastrMessages } from 'src/app/shared/Infrastructure/Constants/toastr-messages';


@Component({
  selector: 'app-add-coa-dialog',
  templateUrl: './add-coa-dialog.component.html',
  styleUrls: ['./add-coa-dialog.component.scss']
})
export class AddCoaDialogComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() itemEdit: ICoaModel;
  @Input() type: CoaType;
  @Input() operation: OperationType;

  protected duplicateOptions$: Observable<ICoaModel[]>;
  protected engagementOptions$: Observable<IEntityScreenModel[]>;
  protected globalCoaOptions$: Observable<ICoaModel[]>;
  public coaType = CoaType;
  public operationType = OperationType;
  public coaForm: FormGroup;

  loading: boolean = false;
  isDuplicate: boolean = false;
  isNameDuplicate: boolean = false;
  isMapping: boolean = false;
  dialogSize: NbComponentSize;
  emptyGuid: string = FSBConstants.emptyGuid;

  private readonly unSubscribe$ = new Subject<void>();
  constructor(
    private engCoaService: EngagementCoaService,
    private engService: EngagementService,
    private globalCoaService: GlobalCoaService,
    private toastr: ToastrService,
    protected ref: NbDialogRef<AddCoaDialogComponent>) { }

  //#region  Lifecycle Hooks
  ngOnInit(): void {
    this.isDuplicate = this.operation === OperationType.Duplicate;
    this.isNameDuplicate = this.isDuplicate;
    this.isMapping = this.operation === OperationType.Mapping;

    this.initForm();
    this.initDropDowns();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  //#endregion

  initForm() {
    this.coaForm = new FormGroup({
      'globalForm': new FormGroup({
        'name': new FormControl<string>('', [Validators.required, Validators.pattern("^[0-9a-zA-Z ]*$")]),
        'duplicateGlobalCoaId': new FormControl(FSBConstants.emptyGuid) //GlobalCoaId or EngagementCoaId in form
      }),
      'engagementForm': new FormGroup({
        'engagements': new FormControl<string[]>([]),
        'duplicateEngagementId': new FormControl(FSBConstants.emptyGuid),
        'globalCoaId': new FormControl(FSBConstants.emptyGuid),
      }),
    });
  }

  initDropDowns() {
    this.loadDuplicateOptions();
    switch (this.type) {
      case CoaType.Global:
        this.loadGlobalCoa();
        break;
      case CoaType.Engagement:
        this.loadDropDowns();
        this.loadEngagementCoa();
        break;
    }
  }

  loadGlobalCoa() {
    switch (this.operation) {
      case OperationType.Duplicate:
        this.coaForm.get('globalForm')?.patchValue({
          'name': `Copy of ${this.itemEdit.name}`,
          'duplicateGlobalCoaId': this.itemEdit.id
        })

        this.coaForm.get('globalForm.name')?.valueChanges
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(value => {
            this.isNameDuplicate = `${value.trim()}`.toLowerCase() === this.itemEdit.name.trim().toLowerCase();
          })
        break;
    }
  }

  loadEngagementCoa() {
    switch (this.operation) {
      case OperationType.Duplicate:
        this.coaForm.get('globalForm')?.patchValue({
          'name': `Copy of ${this.itemEdit.name}`,
          'duplicateGlobalCoaId': this.itemEdit.id
        })
        this.coaForm.get('engagementForm')?.patchValue({
          'engagements': this.itemEdit.engagements.map(x => x.id),
          'duplicateEngagementId': this.itemEdit.id,
          'globalCoaId': this.itemEdit.globalCoaId,
        })

        this.coaForm.get('globalForm.name')?.valueChanges
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(value => {
            this.isNameDuplicate = `${value.trim()}` === this.itemEdit.name;
          })
        break;
      case OperationType.Mapping:
        this.coaForm.get('globalForm')?.patchValue({
          'name': `${this.itemEdit.name}`,
          'duplicateGlobalCoaId': this.itemEdit.id
        })
        this.coaForm.get('engagementForm')?.patchValue({
          'engagements': this.itemEdit.engagements.map(x => x.id),
          'duplicateEngagementId': this.itemEdit.id,
          'globalCoaId': this.itemEdit.globalCoaId,
        })

        break;
    }

  }

  loadDropDowns() {
    this.globalCoaService.items
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(items => this.globalCoaOptions$ = of(items));

    this.engService.getList()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(items => this.engagementOptions$ = of(items));
  }

  loadDuplicateOptions() {
    switch (this.type) {
      case CoaType.Global:
        this.globalCoaService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            this.duplicateOptions$ = of(items)

          });
        break;
      case CoaType.Engagement:
        this.engCoaService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            this.duplicateOptions$ = of(items)
          });
        break;
    }
  }

  onDuplicateSelected(event) {
    if (this.type === CoaType.Engagement) {
      const engagementIds: string[] = [];
      // this.isDuplicate = event ? true : false;
      if (event) {
        event.engagements.forEach((eng: any) => {
          engagementIds.push(eng.id);
        });
      }
      this.coaForm.get('engagementForm')?.patchValue({
        'engagements': engagementIds,
        // 'globalCoaId':''
      })
    }
  }


  close() {
    this.ref.close();
  }
  save() {
    switch (this.operation) {
      case OperationType.Add: this.add(); break;
      case OperationType.Duplicate: this.add(); break;
      case OperationType.Mapping: this.mapEngagements(); break;
    }
  }

  add() {
    this.loading = true;
    const globalForm = this.coaForm.get('globalForm')?.value;
    if (this.isDuplicatedEntry()) return;

    switch (this.type) {
      case CoaType.Global:

        this.globalCoaService.post(globalForm)
          .pipe(tap({
            error: () => this.loading = false,
            complete: () => this.loading = false,
          }), takeUntil(this.unSubscribe$))
          .subscribe(added => {
            if (added) {
              this.toastr.showSuccess('Added successfully.');
              this.globalCoaService.items.next([])
              this.ref.close();
            }
          })
        break;
      case CoaType.Engagement:

        this.coaForm.get('engagementForm')?.patchValue({
          duplicateEngagementId: globalForm.duplicateGlobalCoaId,
        });
        const engagement = {
          name: globalForm.name,
          ...this.coaForm.get('engagementForm')?.value
        };
        this.engCoaService.post(engagement)
          .pipe(tap({
            error: () => this.loading = false,
            complete: () => this.loading = false,
          }), takeUntil(this.unSubscribe$))
          .subscribe(added => {
            if (added) {
              this.toastr.showSuccess('Added successfully.');
              this.engCoaService.items.next([])
              this.ref.close();
            }
          })
        break;
    }
  }

  mapEngagements() {
    if (this.type === CoaType.Engagement) {
      const globalForm = this.coaForm.get('globalForm')?.value;
      this.coaForm.get('engagementForm')?.patchValue({
        duplicateEngagementId: globalForm.duplicateGlobalCoaId,
      });
      const engagement = {
        name: globalForm.name,
        ...this.coaForm.get('engagementForm')?.value
      };
      this.engCoaService.updateEngagementMapping({
        id: this.itemEdit.id,
        engagements: engagement.engagements
      })
        .pipe(tap({
          error: () => { this.loading = false },
          complete: () => this.loading = false
        }), takeUntil(this.unSubscribe$))
        .subscribe(updated => {
          if (updated === true) {
            this.toastr.showSuccess('Mapping updated successfully!');
            this.engCoaService.items.next([]);
            this.ref.close();
          }
        })
    }
  }


  /**
 * Validates if name that will be posted already exists either on engagementCoa or GlobalCoa list
 * @return {boolean} true: if is a duplicated entry. false: not duplicated entry
 */
  isDuplicatedEntry(): boolean {
    let duplicated = false;
    const name: string = this.coaForm.get('globalForm.name')?.value;
    switch (this.type) {
      case this.coaType.Engagement:
        this.engCoaService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            if (items.find(x => x.name.trim().toLowerCase() === name.trim().toLowerCase())) {
              this.toastr.showWarning(ToastrMessages.duplicated);
              duplicated = true;
              this.loading = false;
            }
          })
        break;
      case this.coaType.Global:
        this.globalCoaService.items
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
