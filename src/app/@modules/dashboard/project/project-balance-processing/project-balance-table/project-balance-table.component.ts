import { CurrencyPipe } from '@angular/common';
import { column } from './../../../interfaces/balance-process.interface';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  DoCheck,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { BalanceProcessingService } from 'src/app/@core/services/balance-processing/balance-processing.service';
import {
  BalanceSource,
  ItemFlatNode,
  ItemNode,
  PeriodBreak,
} from '../../../interfaces/balance-process.interface';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { Subject, takeUntil, forkJoin, take, tap } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import {
  ProjectStatus,
  TabType,
} from 'src/app/shared/Infrastructure/constants/constants';
import { NbDialogService } from '@nebular/theme';
import { DropFileDialogComponent } from 'src/app/shared/components/drop-file-dialog/drop-file-dialog.component';

@Component({
  selector: 'app-project-balance-table',
  templateUrl: './project-balance-table.component.html',
  styleUrls: ['./project-balance-table.component.scss'],
})
export class ProjectBalanceTableComponent
  implements OnInit, OnDestroy, DoCheck, OnChanges
{
  @Input()
  balanceSource: BalanceSource;
  @Input()
  periodBreak: PeriodBreak;
  @Input()
  projectType: boolean;
  @Input()
  projectID: string;
  @Output()
  selectTab = new EventEmitter();
  @Output()
  getData = new EventEmitter();

  public IBalanceSource = BalanceSource;
  public IPeriodBreak = PeriodBreak;

  private readonly unSubscribe$ = new Subject<void>();

  public flatNodeMap = new Map<ItemFlatNode, ItemNode>();
  public treeControl: FlatTreeControl<ItemFlatNode>;
  public treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;
  public dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;

  public displayedColumns: string[] = [];
  public loading = false;
  public defaultValue: number;
  public priorYearBalance = false;
  public tabType = TabType.ProjectBalanceSheet;
  public toggleTabs = true;
  public disablePriorYearBox = true;

  public columnsNumber;

  public balanceSheet;
  public incomeSheet;

  public balanceSheetCells: any[] = [];
  public incomeSheetCells: any[] = [];

  public project: any;

  constructor(
    private balanceProcessingService: BalanceProcessingService,
    private toastr: ToastrService,
    protected dashboardService: DashboardService,
    private cdRef: ChangeDetectorRef,
    private currencyPipe: CurrencyPipe,
    private _dialogService: NbDialogService
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<ItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
  }
  ngOnChanges(changes: SimpleChanges): void {
    let input = Object.keys(changes).toString();
    let change = changes[input];
    if (input === 'periodBreak') {
      this.changeColumns(change.currentValue);
    }
    if (input === 'balanceSource') {
      this.updateBalanceSource(change.currentValue)
    }
  }

  getAccountNumber(flatNode) {
    let node = this.findNodeFromFlatnodeMapActiveTable(flatNode);
    return node?.accountNumber;
  }

  ngDoCheck(): void {
    this.cdRef.detectChanges();
  }

  getLevel = (node: ItemFlatNode) => node.level;
  isExpandable = (node: ItemFlatNode) => node.expandable;
  getChildren = (node: ItemNode): ItemNode[] => node.children;
  getNoName = (nodeData: ItemFlatNode) => {
    let withoutSpace = nodeData.item.trim();
    return withoutSpace.length === 0;
  };
  hasParentVisible = (nodeData: ItemFlatNode) => {
    let parent = this.getParentNode(nodeData);
    if (parent?.item === ' ') return nodeData;
    return null;
  };

  transformer = (node: ItemNode, level: number) => {
    const flatNode = new ItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.id = node.id;
    flatNode.parentID = node.parentID;
    flatNode.isTotal = node.isTotal;
    flatNode.columns = node.columns;
    flatNode.pyColumns = node.pyColumns;
    this.flatNodeMap.set(flatNode, node);
    return flatNode;
  };

  getParentNode(node: ItemFlatNode): ItemFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.priorYearBalance = this.projectType;
    this.changeColumns(this.periodBreak);
    this.listenChanges();
    this.getBalanceDatas();
    this.getIncomeDatas();

    this.dashboardService.projectDetails.subscribe((project) => {
      this.project = project;
    });
  }

  expandTree() {
    this.treeControl.expandAll();
  }

  collapseTree() {
    this.treeControl.collapseAll();
  }

  getBalanceDatas() {
    this.loading = true;
    forkJoin({
      tree: this.balanceProcessingService.getBalanceSheet(this.projectID),
      columns: this.balanceProcessingService.getBalanceAmounts(this.projectID),
      pyColumns: this.balanceProcessingService.getBalancePyAmounts(
        this.projectID
      ),
    })
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((data) => {
        this.mergeEmptyColumns(data.tree, TabType.ProjectBalanceSheet, false);
        data.columns.forEach((column) => {
          this.merge(data.tree, column, TabType.ProjectBalanceSheet, false);
        });
        if (data.pyColumns.length > 0) {
          this.mergeEmptyColumns(data.tree, TabType.ProjectBalanceSheet, true);
          data.pyColumns.forEach((column) => {
            this.merge(data.tree, column, TabType.ProjectBalanceSheet, true);
          });
        }
        this.balanceSheet = data.tree;
        this.loading = false;
        if (this.tabType === TabType.ProjectBalanceSheet) {
          this.dataSource.data = this.balanceSheet;
          this.getData.emit({ data: this.balanceSheet });
          this.treeControl.expandAll();
        }
        this.changeColumns(this.periodBreak);
        this.disablePriorYearBox = !!!data.pyColumns.length;
      });
  }

  getIncomeDatas() {
    this.loading = true;
    forkJoin({
      tree: this.balanceProcessingService.getIncomeSheet(this.projectID),
      columns: this.balanceProcessingService.getIncomeAmounts(this.projectID),
      pyColumns: this.balanceProcessingService.getIncomePyAmounts(
        this.projectID
      ),
    })
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((data) => {
        this.mergeEmptyColumns(
          data.tree,
          TabType.ProjectIncomeStatement,
          false
        );
        data.columns.forEach((column) => {
          this.merge(data.tree, column, TabType.ProjectIncomeStatement, false);
        });
        if (data.pyColumns.length > 0) {
          this.mergeEmptyColumns(
            data.tree,
            TabType.ProjectIncomeStatement,
            true
          );
          data.pyColumns.forEach((column) => {
            this.merge(data.tree, column, TabType.ProjectIncomeStatement, true);
          });
        }
        this.incomeSheet = data.tree;
        this.loading = false;
        if (this.tabType === TabType.ProjectIncomeStatement) {
          this.dataSource.data = this.incomeSheet;
          this.getData.emit({ data: this.incomeSheet });
          this.treeControl.expandAll();
        }
      });
  }

  merge(tree, column, tabType, pyColumns: boolean) {
    let type;
    let name;
    if (tabType === TabType.ProjectBalanceSheet) {
      type = 'projectBalanceSheetId';
      name = 'projectBalanceSheetName';
    }
    if (tabType === TabType.ProjectIncomeStatement) {
      type = 'projectIncomeStatementId';
      name = 'projectIncomeStatementName';
    }
    if (pyColumns) {
      tree.forEach((row) => {
        if (row.item.trim() === column[name].trim()) {
          column.amount = column.amount.toString();
          row.pyColumns.splice(column.column + 1, 1, column);
        }
        this.merge(row.children, column, tabType, pyColumns);
      });
    } else {
      tree.forEach((row) => {
        if (row.id === column[type]) {
          column.amount = column.amount.toString();
          row.columns.splice(column.column, 1, column);
        }
        this.merge(row.children, column, tabType, pyColumns);
      });
    }
  }

  mergeEmptyColumns(balance, tabType, pyColumns: boolean) {
    let col: column[] = [];
    let type;
    let columnsType = pyColumns ? 'pyColumns' : 'columns';
    let columnsLength = pyColumns ? this.columnsNumber + 1 : this.columnsNumber;
    if (tabType === TabType.ProjectBalanceSheet) {
      type = 'projectBalanceSheetId';
    }
    if (tabType === TabType.ProjectIncomeStatement) {
      type = 'projectIncomeStatementId';
    }
    balance.forEach((element) => {
      col = [];
      for (let i = 0; i < columnsLength; i++) {
        let obj = {
          id: '',
          amount: '0',
          column: i,
        };
        obj[type] = element.id;
        col.push(obj);
      }
      element[columnsType] = col;

      this.mergeEmptyColumns(element.children, tabType, pyColumns);
    });
  }

  changeColumns(pb) {
    let pyColumnsExist = false;
    if (this.dataSource.data.length > 0) {
      pyColumnsExist = this.dataSource.data[0].hasOwnProperty('pyColumns');
    }
    switch (pb) {
      case this.IPeriodBreak.Monthly:
        this.columnsNumber = 12;
        break;
      case this.IPeriodBreak.Annually:
        this.columnsNumber = 1;
        break;
      case this.IPeriodBreak.HalfYearly:
        this.columnsNumber = 2;
        break;
      case this.IPeriodBreak.Quarterly:
        this.columnsNumber = 4;
        break;
    }
    if (this.priorYearBalance && pyColumnsExist) {
      this.displayedColumns = ['item', 'totalpy', 'total'];
      for (let i = 0; i < this.columnsNumber * 2; i++) {
        this.displayedColumns.push(i.toString());
      }
    } else {
      this.displayedColumns = ['item', 'total'];
      for (let i = 1; i < this.columnsNumber * 2; i += 2) {
        this.displayedColumns.push(i.toString());
      }
    }
  }

  priorYearCheckbox() {
    if (
      !this.dataSource.data[0].hasOwnProperty('pyColumns') &&
      this.priorYearBalance
    ) {
      this.toastr.showWarning(
        'There is no prior year project available in the application.'
      );
    } else this.changeColumns(this.periodBreak);
  }

  listenChanges() {
    this.balanceProcessingService.changeSub
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res) => {
        if (res === TabType.ProjectBalanceSheet) {
          this.getBalanceDatas();
        }
        if (res === TabType.ProjectIncomeStatement) {
          this.getIncomeDatas();
        }
      });
  }

  tabChange(flag: boolean) {
    this.priorYearBalance = false;
    this.toggleTabs = flag;
    this.tabType = flag
      ? TabType.ProjectBalanceSheet
      : TabType.ProjectIncomeStatement;
    let data = flag ? this.balanceSheet : this.incomeSheet;
    this.getData.emit({ data: data });
    this.dataSource.data = data;
    this.changeColumns(this.periodBreak);
    this.treeControl.expandAll();
    if (flag) {
      this.selectTab.emit({ value: 'Balance Sheet' });
    } else {
      this.selectTab.emit({ value: 'Income Statement' });
    }
    this.disablePriorYearBox = !this.dataSource.data[0].hasOwnProperty('pyColumns');   
  }

  findParentFlatNodeFromActiveTable(item) {
    let flatNode = this.treeControl.dataNodes.find(
      (el) => el.id === item.parentID
    );
    return flatNode;
  }
  findNodeFromFlatnodeMapActiveTable(flatNode) {
    let node = this.flatNodeMap.get(flatNode);
    return node;
  }
  calculateRows(columns) {
    let sumValues = columns.reduce((a, b) => a + +b.amount, 0);
    sumValues = this.currencyPipe.transform(sumValues, '', '', '1.0-0');
    return sumValues ? sumValues : null;
  }

  calculateChildrenCol(parentNode, index) {
    let sum = 0;
    parentNode?.children.forEach((child) => {
      if (!child.isTotal) {
        sum += +child.columns[index].amount;
        sum += this.calculateChildrenCol(child, index);
      }
    });
    return sum;
  }

  calculateAccountantRow(item) {
    let sum = 0;
    let children = this.treeControl.dataNodes.filter(
      (x) => x.parentID === item.id
    );
    children.forEach((child) => {
      sum += child.columns.reduce((a, b) => a + +b.amount, 0);
    });
    let sumValues = this.currencyPipe.transform(sum, '', '', '1.0-0');
    return sumValues ? sumValues : null;
  }

  calculateNetProfit() {
    let totalIncomeIndex = this.treeControl.dataNodes.findIndex((dn) => {
      return dn.item === 'Total Income';
    });
    let totalExpensesIndex = this.treeControl.dataNodes.findIndex((dn) => {
      return dn.item === 'Total Expenses';
    });
    let netProfitIndex = this.treeControl.dataNodes.findIndex((dn) => {
      return dn.item === 'Net Profit (Loss)' || dn.item === 'Net Profit';
    });

    if (
      netProfitIndex !== -1 &&
      totalExpensesIndex !== -1 &&
      totalIncomeIndex !== -1
    ) {
      for (
        let i = 0;
        i < this.treeControl.dataNodes[netProfitIndex].columns.length;
        i++
      ) {
        this.treeControl.dataNodes[netProfitIndex].columns[i].amount =
          this.treeControl.dataNodes[totalIncomeIndex].columns[i].amount -
          this.treeControl.dataNodes[totalExpensesIndex].columns[i].amount;
      }
    }
  }

  calculateCol(index: number, item: ItemFlatNode, accountantParent: boolean) {
    if (this.tabType === TabType.ProjectIncomeStatement) {
      this.calculateNetProfit();
    }
    let sum = 0;
    let parentFlatNode;
    let parentNode;

    if (accountantParent) {
      parentNode = this.findNodeFromFlatnodeMapActiveTable(item);
    } else {
      parentFlatNode = this.findParentFlatNodeFromActiveTable(item);
      parentNode = this.findNodeFromFlatnodeMapActiveTable(parentFlatNode);
    }

    sum = this.calculateChildrenCol(parentNode, index);

    if (
      !accountantParent &&
      item.item !== 'Net Profit' &&
      item.item !== 'Net Profit (Loss)'
    ) {
      item.columns[index].amount = sum;
    }

    let sumValues = this.currencyPipe.transform(
      item.columns[index].amount,
      '',
      '',
      '1.0-0'
    );
    if (accountantParent) {
      sumValues = this.currencyPipe.transform(sum, '', '', '1.0-0');
    }

    return sumValues ? sumValues : null;
  }

  downloadBalanceSheet(glFormat: boolean) {
    this.balanceProcessingService
      .downloadBalanceSheet(this.projectID, glFormat)
      .pipe(take(1), tap({ error: () => (this.loading = false) }))
      .subscribe((file) => {
        const url = window.URL.createObjectURL(
          new Blob([file], { type: file.type })
        );
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'BalanceSheet_Template.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;

        this.toastr.showSuccess('Balance Sheet Download Completed.');
      });
  }
  downloadIncomeSheet(glFormat: boolean) {
    this.balanceProcessingService
      .downloadIncomeSheet(this.projectID, glFormat)
      .pipe(take(1), tap({ error: () => (this.loading = false) }))
      .subscribe((file) => {
        const url = window.URL.createObjectURL(
          new Blob([file], { type: file.type })
        );
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'IncomeStatement_Template.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.toastr.showSuccess('Income Sheet Download Completed.');
      });
  }

  download(glFormat: boolean) {
    if (
      this.project.status === ProjectStatus.New ||
      this.project.status === ProjectStatus.ConfigureFS
    ) {
      this.dashboardService
        .changeStatus(this.project, ProjectStatus.TBUpload)
        .subscribe();
    }
    this.loading = true;

    if (this.tabType == TabType.ProjectBalanceSheet) {
      if (this.balanceSheetCells.length) {
        this.balanceProcessingService
          .saveBalanceSheet(this.balanceSheetCells)
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe((data) => {
            data.forEach((res) => {
              this.saveAmountResponseIdToNode(
                this.balanceSheet,
                res,
                TabType.ProjectBalanceSheet
              );
            });
            this.downloadBalanceSheet(glFormat);
            this.balanceSheetCells = [];
          });
      } else {
        this.downloadBalanceSheet(glFormat);
      }
    } else if (this.tabType == TabType.ProjectIncomeStatement) {
      if (this.incomeSheetCells.length) {
        this.balanceProcessingService
          .saveIncomeSheet(this.incomeSheetCells)
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe((data) => {
            data.forEach((res) => {
              this.saveAmountResponseIdToNode(
                this.incomeSheet,
                res,
                TabType.ProjectIncomeStatement
              );
            });
            this.downloadIncomeSheet(glFormat);
            this.incomeSheetCells = [];
          });
      } else {
        this.downloadIncomeSheet(glFormat);
      }
    }
  }

  upload(glFormat: boolean) {
    this._dialogService
      .open(DropFileDialogComponent, {
        context: {
          title: 'Template',
          extensionsAllowed: '.xls,.xlsx',
        },
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((filesResponse) => {
        if (filesResponse.upload === true) {
          this.loading = true;
          this.toastr.showInfo(
            'Uploading file... system will show a notification with status progress'
          );

          if (this.tabType == TabType.ProjectBalanceSheet) {
            this.balanceProcessingService
              .uploadBalanceSheetTreeStructure(
                filesResponse.formData,
                this.projectID,
                glFormat
              )
              .pipe(tap({ error: () => (this.loading = false) }))
              .subscribe((response) => {
                if (response.body.length > 0) {
                  Object.values(response.body).forEach((column) => {
                    this.merge(
                      this.balanceSheet,
                      column,
                      TabType.ProjectBalanceSheet,
                      false
                    );
                  });
                  this.getData.emit({ data: this.balanceSheet });
                  this.toastr.showSuccess('BalanceSheet Upload Completed.');
                  this.loading = false;
                } else {
                  this.toastr.showWarning('No updated values.');
                  this.loading = false;
                }
              });
          } else if (this.tabType == TabType.ProjectIncomeStatement) {
            this.balanceProcessingService
              .uploadIncomeStatementTreeStructure(
                filesResponse.formData,
                this.projectID,
                glFormat
              )
              .pipe(tap({ error: () => (this.loading = false) }))
              .subscribe((response) => {
                if (response.body.length > 0) {
                  Object.values(response.body).forEach((column) => {
                    this.merge(
                      this.incomeSheet,
                      column,
                      TabType.ProjectIncomeStatement,
                      false
                    );
                  });
                  this.getData.emit({ data: this.incomeSheet });
                  this.toastr.showSuccess('IncomeStatement Upload Completed.');
                  this.loading = false;
                } else {
                  this.toastr.showWarning('No updated values.');
                  this.loading = false;
                }
              });
          }
        }
      });
  }

  setDefaultValue(event) {
    this.defaultValue = Number(event.target.value);
  }

  valueEntered(index: number, itemFlatNode: ItemFlatNode) {
    let aamount = itemFlatNode.columns[index].amount
      ? +itemFlatNode.columns[index].amount
      : 0;

    let guid = itemFlatNode.columns[index].id ? true : false;

    if (Number(aamount) === this.defaultValue) return;

    if (this.tabType === TabType.ProjectBalanceSheet) {
      this.getData.emit({ data: this.balanceSheet });
      let item;
      if (guid) {
        item = {
          id: itemFlatNode.columns[index].id,
          amount: aamount,
          column: itemFlatNode.columns[index].column,
          projectBalanceSheetId: itemFlatNode.id,
        };
      } else {
        item = {
          amount: aamount,
          column: itemFlatNode.columns[index].column,
          projectBalanceSheetId: itemFlatNode.id,
        };
      }

      this.balanceProcessingService
        .saveBalanceSheet([item])
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe({
          next: (data) => {
            data.forEach((res) => {
              this.saveAmountResponseIdToNode(
                this.balanceSheet,
                res,
                TabType.ProjectBalanceSheet
              );
            });
          },
          error: () => {
            this.balanceSheetCells = this.balanceSheetCells.filter(
              (x) =>
                !(
                  x.column === item.column &&
                  x.projectBalanceSheetId === item.projectBalanceSheetId
                )
            );
            this.balanceSheetCells.push(item);
          },
        });
    }

    if (this.tabType === TabType.ProjectIncomeStatement) {
      this.getData.emit({ data: this.incomeSheet });
      let item;
      if (guid) {
        item = {
          id: itemFlatNode.columns[index].id,
          amount: aamount,
          column: itemFlatNode.columns[index].column,
          projectIncomeStatementId: itemFlatNode.id,
        };
      } else {
        item = {
          amount: aamount,
          column: itemFlatNode.columns[index].column,
          projectIncomeStatementId: itemFlatNode.id,
        };
      }

      this.balanceProcessingService
        .saveIncomeSheet([item])
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe({
          next: (data) => {
            data.forEach((res) => {
              this.saveAmountResponseIdToNode(
                this.incomeSheet,
                res,
                TabType.ProjectIncomeStatement
              );
            });
          },
          error: () => {
            this.incomeSheetCells = this.incomeSheetCells.filter(
              (x) =>
                !(
                  x.column === item.column &&
                  x.projectIncomeStatementId === item.projectIncomeStatementId
                )
            );
            this.incomeSheetCells.push(item);
          },
        });
    }
  }

  saveAmountResponseIdToNode(sheetArray, res, tabType) {
    let type;
    if (tabType === TabType.ProjectBalanceSheet) {
      type = 'projectBalanceSheetId';
    }
    if (tabType === TabType.ProjectIncomeStatement) {
      type = 'projectIncomeStatementId';
    }
    sheetArray.forEach((item) => {
      if (item.id === res[type]) {
        item.columns[res.column].id = res.id;
      } else {
        this.saveAmountResponseIdToNode(item.children, res, tabType);
      }
    });
  }

  saveUpdates() {
    if (
      this.project.status === ProjectStatus.New ||
      this.project.status === ProjectStatus.ConfigureFS
    ) {
      this.dashboardService
        .changeStatus(this.project, ProjectStatus.TBUpload)
        .subscribe();
    }

    if (!this.incomeSheetCells.length && !this.balanceSheetCells.length) {
      this.toastr.showWarning('Amounts are already saved.');
    }

    if (this.balanceSheetCells.length) {
      this.balanceProcessingService
        .saveBalanceSheet(this.balanceSheetCells)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((data) => {
          data.forEach((res) => {
            this.saveAmountResponseIdToNode(
              this.balanceSheet,
              res,
              TabType.ProjectBalanceSheet
            );
          });
          this.toastr.showSuccess('Balance Sheet Saved.');
          this.balanceSheetCells = [];
        });
    }
    if (this.incomeSheetCells.length) {
      this.balanceProcessingService
        .saveIncomeSheet(this.incomeSheetCells)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((data) => {
          data.forEach((res) => {
            this.saveAmountResponseIdToNode(
              this.incomeSheet,
              res,
              TabType.ProjectIncomeStatement
            );
          });
          this.toastr.showSuccess('Income Statement Saved.');
          this.incomeSheetCells = [];
        });
    }
  }

  updateBalanceSource(balanceSource: BalanceSource) {
    this.balanceProcessingService
      .updateBalanceSource(this.projectID, balanceSource)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(()=>{
        this.toastr.showSuccess(
          `Balance Source changed to ${balanceSource}.`
        );
      });
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.unsubscribe();
  }
}
