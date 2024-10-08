import { BalanceProcessingService } from 'src/app/@core/services/balance-processing/balance-processing.service';
import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BehaviorSubject, take, tap } from 'rxjs';
import { AccountModel, EventAction, ItemFlatNode, ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { BalanceSheetTreeService } from "src/app/@core/services/balance-sheet-tree.service";
import { ToastrService } from "src/app/@core/services/shared/toastr/toastr.service";
import { CoaType, FSBConstants, OperationTypeTree, ProjectStatus, TabType, TreeLevels } from "../../Infrastructure/constants/constants";
import { NbDialogService } from "@nebular/theme";
import { DeleteDialogComponent } from "../delete-dialog/delete-dialog.component";
import { IGenericEntity } from "src/app/@core/models/shared/entity-model";
import { AddAccountDialogComponent } from "../add-account-dialog/add-account-dialog.component";
import { DropFileDialogComponent } from "../drop-file-dialog/drop-file-dialog.component";
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { MENU_ITEMS } from 'src/app/@modules/home-menu';
import { LayoutService } from 'src/app/@core/services/utils/layout.service';


@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.scss'],
  providers: [],
})
export class TreeListComponent implements OnInit, OnChanges, OnDestroy {

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ItemFlatNode, ItemNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ItemNode, ItemFlatNode>();
  treeControl: FlatTreeControl<ItemFlatNode>;
  treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;
  dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number = 0;
  dragNodeExpandOverArea: string = "";

  dragStartEvent: EventAction | undefined;
  dragOverEvent: EventAction | undefined;
  dropEvent: EventAction | undefined;
  dragEnd: DragEvent | undefined;
  addTotalEvent: DragEvent | undefined;
  @ViewChild('emptyItem') emptyItem: ElementRef | undefined;

  @Input() treeData: any;
  @Input() treeType: any;
  @Input() chartOfAccount: string;
  @Input() styleType: string;
  @Input() tabType: TabType;

  public downloading = false;
  public uploading = false;
  dataChange = new BehaviorSubject<ItemNode[]>([]);
  toastr: any;
  operationTypeTree: OperationTypeTree;
  itemEdit: ItemNode;
  addingHeader: boolean = false;

  isStatusCompleted: boolean = false;
  isEditable: boolean = false;
  public project: any;
  public url: string;

  constructor(private el: ElementRef, private balanceSheetTreeService: BalanceSheetTreeService,
    private tastr: ToastrService, private dialogService: NbDialogService, private balanceProcessingService: BalanceProcessingService,
    private dashboardService: DashboardService, private layoutService: LayoutService) {
    this.treeData = [];
    this.chartOfAccount = ""
    this.toastr = tastr;

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this.dashboardService.projectDetails
      .subscribe(project => {
        this.project = project;
      });
    this.layoutService.routerURL.subscribe(url => {
      this.url = url;
    });
    this.dashboardService.completedStatus.subscribe(status => {
      this.isStatusCompleted = status;
      this.isEditable = this.url !== MENU_ITEMS[0].data ? true : !status;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.treeData) {
      this.dataSource.data = this.treeData;
    }
    this.treeControl.dataNodes?.map((item, index) => {
      if (item.item === ' ') this.treeControl.expand(this.treeControl.dataNodes[index])
    })
  }

  getLevel = (node: ItemFlatNode) => node.level;
  getNoName = (_: number, _nodeData: ItemFlatNode) => {
    return _nodeData.item === ' '
  };
  hasParentVisible = (_: number, _nodeData: ItemFlatNode) => {
    let parent = this.getParentNode(_nodeData)
    if (parent?.item === ' ') return _nodeData;
    return null
  }

  isExpandable = (node: ItemFlatNode) => node.expandable;
  getChildren = (node: ItemNode): ItemNode[] => node.children;
  showOptions = (_: number, _nodeData: ItemFlatNode) => true;
  hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === '';
  isTotal = (node: ItemFlatNode) => node.isTotal;
  newGuid = () => crypto.randomUUID();
  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item ? existingNode : new ItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.isTotal = node.isTotal;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
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

  saveNode(node: ItemFlatNode, itemName: string) {

    const isValid = this.validateItem(node, itemName);
    if (!isValid) {
      this.toastr.showError('Not Valid');
      return;
    }

    const nestedNode = this.flatNodeMap.get(node);
    this.updateItem(nestedNode!, itemName);
  }

  updateItem(node: ItemNode, itemName: string) {

    node.item = itemName;
    this.dataChange.next(this.dataSource.data);
    this.saveChanges();
  }

  autoChangeStatus() {
    this.dashboardService.changeStatus(this.project, ProjectStatus.ConfigureFS).subscribe();
  }

  addEditAccountItem(node: ItemFlatNode) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }

    this.openDialog(OperationTypeTree.Add, node);

  }

  addTotalItem(node: ItemFlatNode) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }
    if (node) {
      const currentFlatNode = this.flatNodeMap.get(node);
      if (currentFlatNode) {
        const result = currentFlatNode.children
          .filter(q => q.isTotal == true);

        if (result.length == 0) {
          this.insertItem(currentFlatNode!, `Total ${currentFlatNode.item}`, currentFlatNode!.level + 1, true);
          this.treeControl.expand(node);
          //this.saveChanges();
        } else {
          this.toastr.showError('Not Valid');
        }
      }
    }
  }

  downloadTree() {
    this.openDialog(OperationTypeTree.Download);
  }

  uploadTree() {
    this.openDialog(OperationTypeTree.Upload);
  }

  openDialog2() {

  }

  openDialog(operation: OperationTypeTree, item?: ItemFlatNode): void {
    var headerLabel = '';
    switch (operation) {
      case OperationTypeTree.Add:
        var itemFlatNode = this.flatNodeMap.get(item!);
        headerLabel = `Add/Edit Account ${this.treeType}`;
        this.dialogService.open(AddAccountDialogComponent, {
          context: {
            title: headerLabel,
            itemFlatNode: itemFlatNode
          },
          closeOnBackdropClick: false
        }).onClose.subscribe(obj => {
          if (obj.action) {
            var parentNode = this.flatNodeMap.get(item!) as ItemNode;
            parentNode.children = [];
            for (let i = 0; i < obj.itemRef.accounts.length; i++) {
              const itemId = obj.itemRef.accounts[i].accountId;
              const itemName = obj.itemRef.accounts[i].accountName;
              const itemDescription = obj.itemRef.accounts[i].accountDescription;
              this.insertAccounts(parentNode!, itemId, itemDescription, itemName, parentNode!.level + 1);
            }
            this.dataChange.next(this.dataSource.data);
            this.saveChanges();
            this.treeControl.expand(item!);
          }
        });

        break;
      case OperationTypeTree.Delete:
        headerLabel = `Delete ${this.treeType} ${item?.isTotal ? TreeLevels.Total : item?.level === 0 ? TreeLevels.Header :
          item?.level < 2 ? TreeLevels.Main : TreeLevels.Sub} "${item?.item}"`;
        this.dialogService.open(DeleteDialogComponent, {
          context: {
            title: headerLabel,
            item: item,
            fromTree: true
          },
          closeOnBackdropClick: false
        }).onClose.subscribe(value => {
          if (value != undefined) {
            if (value.deleted) {
              this.deleteItem(item!);
            }
          }
        });
        break;
      case OperationTypeTree.Upload:
        this.dialogService.open(DropFileDialogComponent, {
          context: {
            title: 'Template',
            extensionsAllowed: ".xls,.xlsx"
          },
          closeOnBackdropClick: false
        }).onClose.subscribe(filesResponse => {
          if (filesResponse.upload === true) {
            this.uploading = true;
            this.toastr.showInfo('Uploading file... system will show a notification with status progress')
            if (this.tabType == TabType.ProjectBalanceSheet) {
              this.balanceSheetTreeService.uploadBalanceSheetTreeStructure(filesResponse.formData, this.chartOfAccount)
                .pipe(tap({
                  error: () => this.uploading = false,
                }))
                .subscribe(response => {
                  if (response.body.length > 0) {
                    this.dataSource.data = Object.values(response.body);
                    this.dataChange.next(this.dataSource.data);
                    this.balanceProcessingService.changeSub.next(this.tabType);
                    this.uploading = false;
                    this.toastr.showSuccess('TB Template successfully uploaded');
                  }
                });

            }
            else if (this.tabType == TabType.ProjectIncomeStatement) {
              this.balanceSheetTreeService.uploadIncomeStatementTreeStructure(filesResponse.formData, this.chartOfAccount)
                .pipe(tap({
                  error: () => this.uploading = false,
                }))
                .subscribe(response => {
                  if (response.body.length > 0) {
                    this.dataSource.data = Object.values(response.body);
                    this.dataChange.next(this.dataSource.data);
                    this.balanceProcessingService.changeSub.next(this.tabType);
                    this.uploading = false;
                    this.toastr.showSuccess('TB Template successfully uploaded');
                  }

                });

            }
          }
        })
        break;
      case OperationTypeTree.Download:
        this.downloadTemplate();
        break;
    }

  }

  downloadTemplate() {
    this.downloading = true;

    if (this.tabType == TabType.ProjectBalanceSheet) {
      this.balanceSheetTreeService.getBalanceSheetTreeStructure(this.chartOfAccount)
        .pipe(
          take(1),
          tap({ error: () => this.downloading = false })
        ).subscribe(file => {
          const url = window.URL.createObjectURL(new Blob([file], { type: file.type }));
          const a = document.createElement('a');
          a.setAttribute('href', url);
          a.setAttribute('download', 'BalanceSheet_Template.xlsx');
          a.click();
          window.URL.revokeObjectURL(url);
          this.downloading = false
        })
    } else if (this.tabType == TabType.ProjectIncomeStatement) {
      this.balanceSheetTreeService.getIncomeStatementTreeStructure(this.chartOfAccount)
        .pipe(
          take(1),
          tap({ error: () => this.downloading = false })
        ).subscribe(file => {
          const url = window.URL.createObjectURL(new Blob([file], { type: file.type }));
          const a = document.createElement('a');
          a.setAttribute('href', url);
          a.setAttribute('download', 'IncomeStatement_Template.xlsx');
          a.click();
          window.URL.revokeObjectURL(url);
          this.downloading = false
        })
    }

  }

  deleteItemsAccounts(node: ItemFlatNode) {
    var item = this.flatNodeMap.get(node);
    alert(item?.children.length);
    item?.children.forEach((child: ItemNode) => {
      const flatnode = this.transformer(child, child.level);
      alert(flatnode.item);
      this.deleteAccount(flatnode);
    })
    this.dataChange.next(this.dataSource.data);
    this.saveChanges();
  }

  insertAccounts(parent: ItemNode, itemId: string, itemName: string, itemAccount: string, level: number) {
    if (parent.children == undefined) {
      parent.children = [];
    }
    parent.children.push({
      id: itemId,
      parentID: parent.id,
      item: itemName,
      level: level,
      isTotal: false,
      accountNumber: itemAccount,
      children: []
    } as ItemNode);
  }

  insertSubItem(parent: ItemNode, itemName: string, level: number): string {
    if (parent.children == undefined) {
      parent.children = [];
    }
    var newGuidItem = this.newGuid();
    let totalIndex = parent.children?.findIndex((child: ItemNode) => child.isTotal);
    if (totalIndex > -1) {
      let [totalItem] = parent.children?.splice(totalIndex, 1);
      parent.children.push({
        id: newGuidItem,
        parentID: parent.id,
        item: itemName,
        level: level,
        isTotal: false,
        children: []
      } as ItemNode);
      parent.children.push(totalItem);
    } else {
      parent.children.push({
        id: newGuidItem,
        parentID: parent.id,
        item: itemName,
        level: level,
        isTotal: false,
        children: []
      } as ItemNode);
    }
    this.dataChange.next(this.dataSource.data);
    this.saveChanges();
    return newGuidItem;
  }

  insertItem(parent: ItemNode, itemName: string, level: number, isTotal: boolean) {

    if (parent.children == undefined) {
      parent.children = [];
    }
    let totalIndex = parent.children?.findIndex((child: ItemNode) => child.isTotal);
    if (totalIndex > -1) {
      let [totalItem] = parent.children?.splice(totalIndex, 1);
      parent.children.push({
        id: this.newGuid(),
        parentID: parent.id,
        item: itemName,
        level: level,
        isTotal: isTotal,
        children: []
      } as ItemNode);
      parent.children.push(totalItem);
    } else {
      parent.children.push({
        id: this.newGuid(),
        parentID: parent.id,
        item: itemName,
        level: level,
        isTotal: isTotal,
        children: []
      } as ItemNode);
    }
    this.dataChange.next(this.dataSource.data);
    if (itemName !== '')
      this.saveChanges();
  }

  validateItem(node: ItemFlatNode, itemName: string): boolean {
    const parentFlatNode = this.getParentNode(node);
    if (parentFlatNode) {
      const parentNode = this.flatNodeMap.get(parentFlatNode);
      const currentFlatNode = this.flatNodeMap.get(node);
      if (parentNode && currentFlatNode) {
        const result = parentNode.children
          .filter(q => q.id != currentFlatNode.id && q.item == itemName);

        return result.length == 0;
      }
    } else {
      const nodeDetail = this.flatNodeMap.get(node);
      const result = this.dataSource.data.filter((val: any) => {
        return val.id !== (nodeDetail ? nodeDetail.id : null) && val.item === itemName;
      });
      return result.length === 0;
    }
    return false;
  }

  inputOnKeydown(event: any, name: string, node: any) {

    if (event.keyCode === 13) {

      if (node.level === 0) {
        const updatedNode = this.flatNodeMap.get(node);
        const isTotalNode = updatedNode?.children.find((item: any) => {
          return item.isTotal === true;
        });
        if (isTotalNode) {
          isTotalNode.item = 'Total ' + name;
        }
      }

      this.saveNode(node, name);
    }
    if (event.keyCode === 27) {
      node.editMode = false;
    }
  }

  deleteDefaultValue(event: any, name: string, node: any) {

    const parentNode = this.getParentNode(node);
    if (parentNode) {
      const flatParentNode = this.flatNodeMap.get(parentNode);
      if (flatParentNode) {
        const flatNode = this.flatNodeMap.get(node);
        const index = flatParentNode.children.indexOf(flatNode);
        if (index !== -1) {
          flatParentNode.children.splice(index, 1);
          this.dataChange.next(this.dataSource.data);
          this.flatNodeMap.delete(node);
          this.saveChanges();
        }
      }
    }
  }

  addItem(node: ItemFlatNode) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }
    const parentNode = this.flatNodeMap.get(node);
    this.insertItem(parentNode!, '', parentNode!.level + 1, false);
    this.treeControl.expand(node);
  }

  addSubItem(node: ItemFlatNode) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }
    const parentNode = this.flatNodeMap.get(node);
    this.treeControl.expand(node);
    var itemGuid = this.insertSubItem(parentNode!, ' ', parentNode!.level + 1);
    parentNode?.children.forEach((child: ItemNode) => {
      if (child.id == itemGuid) {
        const flatnode = this.transformer(child, child.level);
        const parent = this.flatNodeMap.get(flatnode);
        this.insertItem(parent!, '', parent!.level + 1, false);
        this.treeControl.expand(flatnode);
      }
    })
  }

  addSubItemDAD(node: ItemFlatNode, nodeDAD: ItemFlatNode): boolean {
    const parentNode = this.flatNodeMap.get(node);
    this.treeControl.expand(node);
    var itemGuid = this.insertSubItem(parentNode!, ' ', parentNode!.level + 1);
    var result = false;
    parentNode?.children.forEach((child: ItemNode) => {

      if (child.id == itemGuid) {
        const flatnodeTo = this.transformer(child, child.level);
        var newitem = this.copyPasteItemDAD(this.flatNodeMap.get(nodeDAD)!, this.flatNodeMap.get(flatnodeTo)!);
        result = true
      }
    });

    return result;
  }

  renameItem(node: any) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }
    node.editMode = true;
  }

  deleteItemDialog(node: ItemFlatNode) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }
    this.openDialog(OperationTypeTree.Delete, node);
  }

  deleteAccount(node: ItemFlatNode) {
    const parentNode = this.getParentNode(node);
    if (parentNode) {
      const flatParentNode = this.flatNodeMap.get(parentNode);
      if (flatParentNode) {
        const flatNode = this.flatNodeMap.get(node);
        const index = flatParentNode.children.indexOf(flatNode);
        if (index !== -1) {
          flatParentNode.children.splice(index, 1);
          this.flatNodeMap.delete(node);
        }
      }
    }
  }

  deleteItem(node: ItemFlatNode) {
    const parentNode = this.getParentNode(node);
    if (parentNode) {
      const flatParentNode = this.flatNodeMap.get(parentNode);
      if (flatParentNode?.item === ' ') this.deleteItem(parentNode)
      else if (flatParentNode) {
        const flatNode = this.flatNodeMap.get(node);
        const index = flatParentNode.children.indexOf(flatNode);
        if (index !== -1) {
          flatParentNode.children.splice(index, 1);
          this.dataChange.next(this.dataSource.data);
          this.flatNodeMap.delete(node);
          this.saveChanges();
        }
      }
    } else {
      const nodeDetail = this.flatNodeMap.get(node);
      const index = this.dataSource.data.findIndex((val: any) => {
        return val.id === (nodeDetail ? nodeDetail.id : null)
      });
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataChange.next(this.dataSource.data);
        this.flatNodeMap.delete(node);
        this.saveChanges();
      }
    }
  }

  saveChanges() {
    let coaT = 0;
    if (this.treeType == 'Engagement') {
      coaT = CoaType.Engagement;
    }
    else {
      coaT = CoaType.Global;
    }
    const params = {
      coaid: this.chartOfAccount,
      nodeItems: this.dataSource.data
    };
    if (this.tabType == TabType.BalanceSheet) {
      this.balanceSheetTreeService.saveBalanceSheet(params, coaT).subscribe(data => {
        this.toastr.showSuccess("Successfully edited", '');
      });
    } else if (this.tabType == TabType.IncomeStatement) {
      this.balanceSheetTreeService.saveIncomeStatement(params, coaT).subscribe(data => {
        this.toastr.showSuccess("Successfully edited", '');
      });
    } else if (this.tabType == TabType.ProjectBalanceSheet) {
      const projectparams = {
        projectId: this.chartOfAccount,
        nodeItems: this.dataSource.data
      }
      this.balanceSheetTreeService.saveProjectFsStructuring(projectparams, this.tabType).subscribe(data => {
        this.balanceProcessingService.changeSub.next(this.tabType);
        this.toastr.showSuccess("Successfully edited", '');
      });
    } else if (this.tabType == TabType.ProjectIncomeStatement) {
      const projectparams = {
        projectID: this.chartOfAccount,
        nodeItems: this.dataSource.data
      }
      this.balanceSheetTreeService.saveProjectFsStructuring(projectparams, this.tabType).subscribe(data => {
        this.balanceProcessingService.changeSub.next(this.tabType);
        this.toastr.showSuccess("Successfully edited",);
      });
    }
    else {
      this.toastr.showError('Error');
    }

    this.treeControl.dataNodes.map((item, index) => {
      if (item.item === ' ') {
        this.treeControl.collapse(this.treeControl.dataNodes[index])
        this.treeControl.expand(this.treeControl.dataNodes[index])
      }
    })

  }

  AddTotal(node) {
    if (node.level == 2) {
      var nodeI = this.flatNodeMap.get(node);
      var isTotal = nodeI?.isTotal;
      if (isTotal) {
        this.renameItem(node);
      }
    }
  }

  /*Logic to Drag and Drog*/
  handleDragStart(eve: EventAction) {
    if (this.url === MENU_ITEMS[0].data && this.isStatusCompleted) {
      return;
    } else if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }

    this.dragStartEvent = eve;
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    this.dragStartEvent.event.dataTransfer!.setData('foo', 'bar');
    this.dragStartEvent.event.dataTransfer!.setDragImage(this.emptyItem!.nativeElement, 0, 0);
    this.dragNode = this.dragStartEvent.node;

    this.treeControl.collapse(this.dragStartEvent.node);
  }
  handleDragOver(eve: EventAction) {
    if (this.url === MENU_ITEMS[0].data && this.isStatusCompleted) {
      return;
    }
    this.dragOverEvent = eve;
    this.dragOverEvent.event.preventDefault();
    // Handle node expand
    if (this.dragOverEvent.node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== this.dragOverEvent.node && !this.treeControl.isExpanded(this.dragOverEvent.node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(this.dragOverEvent.node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = this.dragOverEvent.node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }
    // Handle drag area
    const percentageX = this.dragOverEvent.event.offsetX / this.dragOverEvent.event.clientX * 100;
    const percentageY = this.dragOverEvent.event.offsetY / this.dragOverEvent.event.clientY * 100;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 4.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }
  handleDrop(eve: EventAction) {
    if (this.url === MENU_ITEMS[0].data && this.isStatusCompleted) {
      return;
    }
    this.dropEvent = eve;
    this.dropEvent.event.preventDefault();

    let valu = this.getChildren(this.dragNode);

    this.ValidateDropItem(this.dropEvent.node, this.dragNode);

    // if (!isValid){
    //   alert("No posible");
    //   return;
    // }

    // if (this.dropEvent.node !== this.dragNode) {
    //    let newItem: ItemNode;
    //    if (this.dragNode.level === 3){
    //     newItem = this.copyPasteItemBelowDAD(this.flatNodeMap.get(this.dragNode)!,this.flatNodeMap.get(this.dropEvent.node)!);
    //    }
    //    else {
    //     newItem = this.copyPasteItemDAD(this.flatNodeMap.get(this.dragNode)!,this.flatNodeMap.get(this.dropEvent.node)!);
    //    }
    //   if (this.dragNodeExpandOverArea === 'above') {
    //     newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(this.dropEvent.node)!);
    //   } else if (this.dragNodeExpandOverArea === 'below') {
    //     newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(this.dropEvent.node)!);
    //   } else {
    //     newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(this.dropEvent.node)!);
    //   }

    //  this.deleteItemDAD(this.flatNodeMap.get(this.dragNode)!);
    //  this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem)!);
    //}
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }
  handleDragEnd(event: any) {
    if (this.url === MENU_ITEMS[0].data && this.isStatusCompleted) {
      return;
    }
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  /*Drag and Drop Items */
  copyPasteItemDAD(from: ItemNode, to: ItemNode): ItemNode {
    const newItem = this.insertItemDAD(to, from.item, from.level, from.isTotal, from.accountNumber);
    if (from.children) {
      from.children.forEach((child: ItemNode) => {
        this.copyPasteItemDAD(child, newItem);
      });
    }
    return newItem;
  }

  insertItemDAD(parent: ItemNode, name: string, level: number, isTotal: boolean, account: string): ItemNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = { id: this.newGuid(), parentID: parent.id, item: name, level: level, isTotal: isTotal, accountNumber: account, children: [] } as ItemNode;
    let totalIndex = parent.children?.findIndex((child: ItemNode) => child.isTotal);
    if (totalIndex > -1) {
      let [totalItem] = parent.children.splice(totalIndex, 1);
      parent.children.push(newItem);
      parent.children.push(totalItem);
    } else {
      parent.children.push(newItem);
    }
    this.dataChange.next(this.dataSource.data);
    //this.saveChanges();
    return newItem;
  }

  deleteItemDAD(node: ItemNode) {
    this.deleteNodeDAD(this.dataSource.data, node);
    this.dataChange.next(this.dataSource.data);
    this.saveChanges();
  }
  deleteNodeDAD(nodes: ItemNode[], nodeToDelete: ItemNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNodeDAD(node.children, nodeToDelete);
        }
      });
    }
  }
  copyPasteItemBelowDAD(from: ItemNode, to: ItemNode): ItemNode {
    let below = this.checkPositions(from, to);
    const newItem = this.insertItemBelowDAD(to, from.item, from.level, from.isTotal, from.accountNumber, below);
    if (from.children) {
      from.children.forEach((child: ItemNode) => {
        this.copyPasteItemDAD(child, newItem);
      });
    }
    return newItem;
  }
  insertItemBelowDAD(node: ItemNode, name: string, level: number, isTotal: boolean, account: string, belowOrAbove: boolean): ItemNode {
    const parentNode = this.getParentFromNodesDAD(node);
    const newItem = { id: this.newGuid(), parentID: parentNode?.id, item: name, level: level, isTotal: isTotal, accountNumber: account, children: [] } as ItemNode;
    if (parentNode != null && parentNode.children !== undefined) {
      if (belowOrAbove) {
        parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
      }
      else {
        parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
      }
    } else {
      this.dataSource.data.splice(this.dataSource.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.dataSource.data);
    //this.saveChanges();
    return newItem;
  }
  getParentFromNodesDAD(node: ItemNode): ItemNode | null {
    for (let i = 0; i < this.dataSource.data.length; ++i) {
      const currentRoot = this.dataSource.data[i];
      const parent = this.getParentDAD(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }
  getParentDAD(currentRoot: ItemNode, node: ItemNode): ItemNode | null {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParentDAD(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  DeleteItemsDropped(newItem: ItemNode) {
    this.deleteItemDAD(this.flatNodeMap.get(this.dragNode)!);
    this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem)!);
  }

  checkPositions(nodeTo: ItemNode, nodeFrom: ItemNode) {
    const nodeToParent = this.getParentFromNodesDAD(nodeTo);
    const nodeFromParent = this.getParentFromNodesDAD(nodeFrom);

    return nodeFromParent?.children.indexOf(nodeFrom) > nodeToParent?.children.indexOf(nodeTo);
  }

  ValidateDropItem(nodeTo: ItemFlatNode, nodeFrom: ItemFlatNode) {
    let newItem: ItemNode
    let isDelete = false;
    if (nodeFrom.level === 0) {
    console.log(nodeFrom);
      return;
    }
    if (nodeFrom.level === 1) {
      if (nodeTo.level > 0) {
        if (nodeTo.level === 1) {
          newItem = this.copyPasteItemBelowDAD(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(nodeTo)!);
          isDelete = true;
        } else {
          this.toastr.showWarning('Not valid');
        }
      }
      else {
        newItem = this.copyPasteItemDAD(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(nodeTo)!);
        isDelete = true;
      }
    }
    if (nodeFrom.level === 2) {
      if (nodeTo.level === 1) {
        newItem = this.copyPasteItemDAD(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(nodeTo)!);
        isDelete = true;
      } else if (nodeTo.level === 2) {
        newItem = this.copyPasteItemBelowDAD(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(nodeTo)!);
        isDelete = true;
      }
      else {
        if (nodeTo.level === 0) {
          isDelete = this.addSubItemDAD(nodeTo, nodeFrom);
        } else {
          this.toastr.showWarning('Not valid');
        }
      }
    }
    if (nodeFrom.level === 3) {
      if (nodeTo.level === 2) {
        newItem = this.copyPasteItemDAD(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(nodeTo)!);
        isDelete = true;
      } else if (nodeTo.level === 3) {
        newItem = this.copyPasteItemBelowDAD(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(nodeTo)!);
        isDelete = true;
      }
      else {
        this.toastr.showWarning('Not valid');
      }
    }
    if (isDelete) {
      this.deleteItemDAD(this.flatNodeMap.get(this.dragNode)!);
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem!)!);
    }

    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  expandTree() {
    this.treeControl.expandAll();
  }

  collapseTree() {
    this.treeControl.collapseAll();
  }

  addHeader() {
    this.addingHeader = true;
  }

  deleteDefaultHeader() {
    this.addingHeader = false;
  }

  headerOnKeydown = ($event: any) => {
    if ($event.keyCode === 13) {
      if ($event.target.value !== '') {
        this.addingHeader = false;
        const newHeader: ItemNode = {
          accountNumber: '',
          id: this.newGuid(),
          parentID: null,
          item: $event.target.value,
          level: 0,
          isTotal: false,
          children: [],
        }
        this.dataSource.data.push(newHeader)
        this.dataChange.next(this.dataSource.data);
        const arr = Array.from(this.flatNodeMap.values())
        const newNode = arr[arr.length - 1];
        if (newNode) {
          this.insertItem(newNode!, `Total ${newNode.item}`, newNode!.level + 1, true);
        }
      }
    }
  }

  deleteHeaderDialog(node: ItemFlatNode) {
    if (this.url === MENU_ITEMS[0].data && this.project.id != '' && this.project.status === ProjectStatus.New) {
      this.autoChangeStatus();
    }
    this.openDialog(OperationTypeTree.Delete, node);
  }

  ngOnDestroy(): void {
    this.dataChange.unsubscribe();
  }

}



