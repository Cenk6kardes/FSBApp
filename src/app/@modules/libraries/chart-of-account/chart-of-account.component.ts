import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  OnDestroy,
  ElementRef
} from '@angular/core';
import { Columns, Config, DefaultConfig, APIDefinition, API } from 'ngx-easy-table';
import { NbDialogRef, NbDialogService, NbMenuService } from '@nebular/theme';
import { Subject, takeUntil, tap } from 'rxjs';
import { CoaType, OperationType } from '../../../shared/Infrastructure/constants/constants';
import { ICoaModel } from '../../../@core/models/library/coa-models';
import { Router } from '@angular/router';
import { AddCoaDialogComponent } from '../add-coa-dialog/add-coa-dialog.component';
import { FormControl, Validators } from '@angular/forms';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { ToastrService } from '../../../@core/services/shared/toastr/toastr.service';
import { EngagementCoaService } from '../../../@core/services/library/engagement-coa.service';
import { GlobalCoaService } from '../../../@core/services/library/global-coa.service';
import { ToastrMessages } from 'src/app/shared/Infrastructure/Constants/toastr-messages';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Pagination } from "ngx-easy-table/lib";

@Component({
  selector: 'app-chart-of-account',
  templateUrl: './chart-of-account.component.html',
  styleUrls: ['./chart-of-account.component.scss']
})
export class ChartOfAccountComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() tableOutput = new EventEmitter<APIDefinition>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() type: CoaType;
  private itemSelected: ICoaModel | undefined;
  private readonly unSubscribe$ = new Subject<void>();
  private dialogRef: NbDialogRef<any>;
  public title: string;
  public operationType = OperationType;
  public data: ICoaModel[] = [];
  public dataCopy: any = [];
  public ellipseMenu: any = [];
  loading: boolean = false;
  renaming: boolean = false;
  public paginationEngCoaTotalItems: number;
  public paginationGlobalCoaTotalItems: number;
  public pagination: Pagination;

  //#region Table config props
  public configuration!: Config;
  public renameIndex: number;
  public columns!: Columns[];
  @ViewChild('table', { static: true }) table!: APIDefinition;
  @ViewChild('nameInputTpl', { static: false }) nameInputTpl: HTMLInputElement;
  public nameInput = new FormControl('', [Validators.required]);
  // table custom templates
  @ViewChild('nameTpl', { static: true }) nameTpl!: TemplateRef<any>;
  @ViewChild('activeTpl', { static: true }) activeTpl!: TemplateRef<any>;
  @ViewChild('engMappingTpl', { static: true }) engMappingTpl!: TemplateRef<any>;
  @ViewChild('ellipsesTpl', { static: true }) ellipsesTpl!: TemplateRef<any>;
  @ViewChild('countTpl', { static: true }) countTpl!: TemplateRef<any>;
  @ViewChild('nameHeaderActionTemplate', { static: true }) nameHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('countHeaderActionTemplate', { static: true }) countHeaderActionTemplate: TemplateRef<any>;
  @ViewChild('engMappingHeaderActionTemplate', { static: true }) engMappingHeaderActionTemplate: TemplateRef<any>;

  public selectedName: string = '';
  public selectedEngagements: string = '';

  //inputRename
  @ViewChild('inputRename', { static: false }) inputRename!: ElementRef<any>

  //#endregion

  constructor(
    private engCoaService: EngagementCoaService,
    private globalCoaService: GlobalCoaService,
    private router: Router,
    private toastr: ToastrService,
    private menuService: NbMenuService,
    private dialogService: NbDialogService) {
  }

  //#region Lifecylce Hooks
  ngOnInit(): void {
    this.initTableConfig();
    this.loadDataTable();
    this.selectedItemListener();
  }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = "Show";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const pageRange = (length == 0) ? `0/0` : `${page + 1}/${Math.ceil(length / pageSize)}`;
      return `${pageRange}`;
    };
    this.tableOutput.emit(this.table);
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  //#endregion

  //#region  Table functions
  private initTableConfig() {
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.setColumns();
    this.setMenu();
  }

  private setColumns() {
    this.columns = [
      {
        key: 'name', title: 'COA Name', cellTemplate: this.nameTpl,
        headerActionTemplate: this.nameHeaderActionTemplate, width: 'auto'
      },
      {
        key: 'projectCount', title: 'No of Projects Assigned', cellTemplate: this.countTpl,
        headerActionTemplate: this.countHeaderActionTemplate, width: 'auto'
      },
      { key: 'active', title: 'Status', cellTemplate: this.activeTpl, width: 'auto' },
    ];
    if (this.type == CoaType.Engagement)
      this.columns.push({
        key: 'engagementMapping',
        title: 'Engagement Mapping',
        width: '35%',
        cellTemplate: this.engMappingTpl,
        headerActionTemplate: this.engMappingHeaderActionTemplate
      });

    this.columns.push({ key: 'id', title: '', cellTemplate: this.ellipsesTpl, width: 'auto' });
  }

  private setMenu() {
    this.ellipseMenu = [
      { icon: 'copy', title: 'Duplicate' },
      { icon: 'edit', title: 'Edit' },
      { icon: 'text', title: 'Rename' },
      { icon: 'trash', title: 'Delete' },
    ];

    if (this.type == CoaType.Engagement)
      this.ellipseMenu.splice(this.ellipseMenu.length - 1, 0, { icon: 'share', title: 'Mapping' });
  }

  udpateRow(rowIndex: number): void {
    this.renameIndex = rowIndex;
    this.nameInput.setValue(this.itemSelected?.name ?? '');
    setTimeout(() => {
      this.inputRename.nativeElement.focus()
    }, 0);
  }

  saveRename(): void {
    this.renaming = true;
    const item = this.data.find(x => x.id === this.itemSelected?.id)!;
    const newName = this.nameInput.value!;
    const previousName = item.name;

    // item.name = this.nameInput.value!;
    if (this.isDuplicatedEntry({ id: item.id, name: newName })) {
      item.name = previousName;
      return;
    }

    switch (this.type) {
      case CoaType.Global:
        this.globalCoaService.update({ id: item.id, name: newName, active: item.active })
          .pipe(tap({
            error: () => {
              item.name = previousName;
              this.renaming = false
            },
            complete: () => this.renaming = false
          }), takeUntil(this.unSubscribe$))
          .subscribe(renamed => {
            if (renamed === true) {
              item.name = newName;
              this.renameIndex = -1; //set renameIndex to none
              this.toastr.showSuccess('Renamed successfully!')
            }
          })
        break;
      case CoaType.Engagement:
        this.engCoaService.update({ id: item.id, name: newName, active: item.active })
          .pipe(tap({
            error: () => {
              item.name = previousName;
              this.renaming = false
            },
            complete: () => this.renaming = false
          }), takeUntil(this.unSubscribe$))
          .subscribe(renamed => {
            if (renamed === true) {
              item.name = newName;
              this.renameIndex = -1; //set renameIndex to none
              this.toastr.showSuccess('Renamed successfully!')
            }
          })
        break;
    }
  }

  cancelRename(): void {
    this.renameIndex = -1;
  }

  stringify = (object: object): string => {
    return JSON.stringify(object)
  }

  /**
   * Validates if name that will be posted already exists either on engagementCoa or GlobalCoa list
   * @return {boolean} true: if is a duplicated entry. false: not duplicated entry
   */
  isDuplicatedEntry(item: { id: string, name: string }): boolean {
    let duplicated = false;
    const name = item.name.trim().toLowerCase();

    switch (this.type) {
      case CoaType.Global:
        this.globalCoaService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            if (items.some(x => x.name.trim().toLowerCase() === name)) {
              this.toastr.showWarning(ToastrMessages.duplicated);
              duplicated = true;
              this.renaming = false;
            }
          })
        break;
      case CoaType.Engagement:
        this.engCoaService.items
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe(items => {
            if (items.some(x => x.name.trim().toLowerCase() === name)) {
              this.toastr.showWarning(ToastrMessages.duplicated);
              duplicated = true;
              this.renaming = false;
            }
          })
        break;
    }

    return duplicated;
  }

  //#endregion

  selectedItemListener() {
    this.menuService.onItemClick()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(evt => {
        const objAux = JSON.parse(evt.tag);
        const id = objAux.id;
        const rowIndex = objAux.index;

        this.itemSelected = this.data.find(item => item.id == id);
        if (this.itemSelected) this.menuGoTo(evt.item.icon, rowIndex);
        //this.itemSelected.emit({ id: selected.id, name: selected.name, active: selected.active });
      });
  }

  menuGoTo(action, rowIndex?: number) {
    switch (action) {
      case "edit":
        this.router.navigate(['home/libraries/edit', this.itemSelected!.id, this.itemSelected!.name, this.type]);
        break;
      case 'copy':
        this.openDialog(this.operationType.Duplicate, this.itemSelected);
        break;
      case 'text':
        this.udpateRow(rowIndex ?? 0);
        break;
      case 'trash':
        this.openDialog(this.operationType.Delete, this.itemSelected);
        break;
      case 'share':
        this.openDialog(this.operationType.Mapping, this.itemSelected);
        break;
    }
  }

  toggleStatus(status: boolean, id: string) {
    const element = this.data.find(x => x.id == id);
    switch (this.type) {
      case CoaType.Global:
        this.globalCoaService.toggleStatus(element!)
          .subscribe(result => {
            if (result === true) {
              element!.active = status;
              const label = element?.active ? 'Activated' : 'Deactivated';
              this.toastr.showSuccess(`${label} successfully`);
            }
          });
        break;
      case CoaType.Engagement:
        this.engCoaService.toggleStatus(element!)
          .subscribe(result => {
            if (result === true) {
              element!.active = status;
              const label = element?.active ? 'Activated' : 'Deactivated';
              this.toastr.showSuccess(`${label} successfully`);
            }
          });
        break;
    }
  }

  public openDialog(operation: OperationType, item?: ICoaModel): void {
    let headerLabel = '';
    switch (operation) {
      case OperationType.Add:
        headerLabel = `Add ${this.title}`;
        break;
      case OperationType.Update:
        headerLabel = `Edit ${this.title}`;
        break;
      case OperationType.Duplicate:
        headerLabel = `Duplicate ${this.title}: ${item?.name}`;
        break;
      case OperationType.Mapping:
        headerLabel = `Map Engagements of: ${item?.name}`;
        break;
      case OperationType.Delete:
        headerLabel = `Delete ${this.title}: ${item?.name}`;
        this.dialogRef = this.dialogService.open(DeleteDialogComponent, {
          context: {
            title: headerLabel,
            item: item,
          },
          closeOnBackdropClick: false
        })

        this.dialogRef.componentRef.instance.delete.subscribe(deleted => {
          if (deleted === true)
            this.delete(item?.id!)
        })
        return;
      default:
        return;
    }
    this.dialogRef = this.dialogService.open(AddCoaDialogComponent, {
      context: {
        title: headerLabel,
        itemEdit: item,
        type: this.type,
        operation: operation
      },
      closeOnBackdropClick: false
    })
  }

  delete(id: string) {
    switch (this.type) {
      case CoaType.Global:
        this.globalCoaService.delete(id)
          .pipe(tap({
            error: () => this.dialogRef.componentRef.instance.loading = false
          }),
            takeUntil(this.unSubscribe$))
          .subscribe(result => {
            if (result === true) {
              this.dialogRef.componentRef.instance.loading = false
              this.dialogRef.close();
              this.toastr.showSuccess("GlobalCOA deleted!")
              this.globalCoaService.items.next([]);
            }
          })
        break;
      case CoaType.Engagement:
        this.engCoaService.delete(id)
          .pipe(tap({
            error: () => this.dialogRef.componentRef.instance.loading = false
          }),
            takeUntil(this.unSubscribe$))
          .subscribe(result => {
            if (result === true) {
              // const index = this.data.findIndex(x => x.id === id);
              // this.data.splice(index, 1);
              this.dialogRef.componentRef.instance.loading = false
              this.dialogRef.close();
              this.toastr.showSuccess("Engagement deleted!")
              this.engCoaService.items.next([]);
            }
          })
        break;
    }

    // deleteDialogRef.close();
    // deleteDialogRef.componentRef.instance.loading = false;
  }

  loadDataTable() {
    if (this.type == CoaType.Global) this.loadGlobalCoa();
    if (this.type == CoaType.Engagement) this.loadEngCoa();
  }

  loadGlobalCoa() {
    this.title = 'Global COA';
    this.loading = true;
    this.globalCoaService.items
      .pipe()
      .subscribe(items => {
        if (items.length > 0) {
          this.data = items;
          this.paginationGlobalCoaTotalItems = this.data.length;
        } else {
          this.globalCoaService.getList()
            .pipe(tap({
              error: () => this.loading = false
            }), takeUntil(this.unSubscribe$))
            .subscribe(list => {
              if (list.length > 0) {
                this.globalCoaService.items.next(list)
                this.data = list;
                this.dataCopy = [...this.data];
                this.loading = false;
                this.paginationGlobalCoaTotalItems = this.data.length;
              }
            });
        }
        this.loading = false
      })
  }

  loadEngCoa() {
    this.title = 'Engagement COA';
    this.loading = true;
    this.engCoaService.items
      .pipe()
      .subscribe(items => {
        if (items.length > 0) {
          this.data = items;
          this.paginationEngCoaTotalItems = this.data.length;
        } else {
          this.engCoaService.getList()
            .pipe(tap({
              error: () => this.loading = false
            }), takeUntil(this.unSubscribe$))
            .subscribe(list => {
              if (list.length > 0) {
                this.engCoaService.items.next(list)
                this.data = list;
                this.dataCopy = [...this.data];
                this.loading = false;
                this.paginationEngCoaTotalItems = this.data.length;
              }
            })
        }
        this.loading = false
      })
  }

  sortByAsc(field: string): void {
    if (field == 'name') {
      this.data = [
        ...this.data.sort((a, b) => {
          const userA = a[field].toLowerCase();
          const userB = b[field].toLowerCase();
          return userA.localeCompare(userB);
        }),
      ];
    }
    if (field == 'projectCount') {
      this.data = [
        ...this.data.sort((a, b) => a[field] - b[field])
      ];
      return;
    }
    if (field == 'engagements') {
      this.data = [
        ...this.data.sort((a, b) => {
          let userA = '';
          let userB = '';
          a[field].forEach(eng => {
            userA = eng.name;
          })
          b[field].forEach(ent => {
            userB = ent.name;
          })
          return userA.localeCompare(userB);
        }),
      ];
    }
  }

  sortByDesc(field: string): void {
    if (field == 'name') {
      this.data = [
        ...this.data.sort((a, b) => {
          const userA = a[field].toLowerCase();
          const userB = b[field].toLowerCase();
          return userB.localeCompare(userA);
        }),
      ];
    }
    if (field == 'projectCount') {
      this.data = [
        ...this.data.sort((a, b) => b[field] - a[field])
      ];
      return;
    }
    if (field == 'engagements') {
      this.data = [
        ...this.data.sort((a, b) => {
          let userA = '';
          let userB = '';

          a[field].forEach(ent => {
            userA = ent.name;
          })
          b[field].forEach(ent => {
            userB = ent.name;
          })
          return userB.localeCompare(userA);
        }),
      ];
    }
  }

  filter(field: string, event: Event | string): void {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;

    if (field === 'name') {
      this.selectedName = value;
      this.data = [...this.dataCopy].filter(({ name }) => {
        return (
          name.toLocaleLowerCase().includes(this.selectedName.toLocaleLowerCase())
        );
      });
    }

    if (field === 'engagements') {
      this.selectedEngagements = value;
      this.data = [...this.dataCopy].filter(({ engagements }) => {
        return (
          this.selectedEngagements !== '' ?
            engagements.find(x => x.name.toLocaleLowerCase().includes(this.selectedEngagements.toLocaleLowerCase())) : engagements
            )
      });
    }
  }


  updateTotalItems() {
    if (this.type === 1) {
      this.paginationGlobalCoaTotalItems = this.data.length;
    }
    if (this.type === 2) {
      this.paginationEngCoaTotalItems = this.data.length;
    }
  }

  paginationEvent(event: PageEvent): void {
    this.pagination = {
      ...this.pagination,
      limit: event.pageSize,
      offset: event.pageIndex + 1,
      count: event.length,
    };
  }
}
