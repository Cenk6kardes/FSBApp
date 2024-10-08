import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { BehaviorSubject, Subject, take, takeUntil } from 'rxjs';
import { ItemFlatNode, ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';
import { FSBConstants } from '../../Infrastructure/constants/constants';


@Component({
  selector: 'app-tree-menu-options',
  templateUrl: './tree-menu-options.component.html',
  styleUrls: ['./tree-menu-options.component.scss']
})
export class TreeMenuOptionsComponent implements OnInit {
  @Input() node: ItemFlatNode;
  @Input() flatNodeMap = new Map<ItemFlatNode, ItemNode>();
  @Input() dataChange = new BehaviorSubject<ItemNode[]>([]);
  @Input() dataSource: any;
  @Input() treeControl: any;
  @Input() treeType: any;

  @ViewChild('ellipsesTpl', { static: true }) ellipsesTpl!: TemplateRef<any>;
  public ellipseMenu: any = [];
  public nodeSelected: ItemFlatNode;
  private readonly unSubscribe$ = new Subject<void>();
  isSelected: boolean = false;

  @Output() AddModeEmitter = new EventEmitter<any>();
  @Output() DeleteModeEmitter = new EventEmitter<any>();
  @Output() RenameModeEmitter = new EventEmitter<any>();
  @Output() AddTotalModeEmitter = new EventEmitter<any>();
  @Output() AddEditAccountsModeEmitter = new EventEmitter<any>();
  @Output() AddNewSubItemEmitter = new EventEmitter<any>();
  @Output() DeleteHeaderEmitter = new EventEmitter<any>();

  constructor(private menuService: NbMenuService) { }

  ngOnInit(): void {
    this.setMenu();
    //this.selectedItemListener();
  }


  selectedItemListener(node: ItemFlatNode) {
    this.nodeSelected = node;
    this.menuService.onItemClick()
      .pipe(take(1))
      .subscribe(evt => {
        if (evt.tag == node.item) {
          const title = evt.item.title;
          const action = FSBConstants.treeMenuItems.EngagementCOA.treeContextMenuOptions
            .filter(event => event.level == this.node.level && event.title == title);
          if (action.length > 0)
            this.triggerEvent(node, action[0].onClick)
        }
      });
  }

  setMenu() {
    if (this.treeType == "Engagement" || this.treeType == "Project") {
      if (this.node.isTotal)
        this.ellipseMenu = FSBConstants.treeMenuItems.EngagementCOA.treeContextMenuOptions.filter(event => event.total);
      else
        this.ellipseMenu = FSBConstants.treeMenuItems.EngagementCOA.treeContextMenuOptions.filter(event => event.level == this.node.level);
    }
    else if (this.treeType == "Global")
      this.ellipseMenu = FSBConstants.treeMenuItems.GlobalCOA.treeContextMenuOptions.filter(event => event.level == this.node.level);

  }

  startEvent(node: ItemFlatNode) {
    this.selectedItemListener(node);
  }


  triggerEvent(node: ItemFlatNode, item: any) {

    switch (item) {
      case 'addNewItem':
        this.addNewItem(node);
        break;
      case 'addNewSubItem':
        this.addNewSubItem(node);
        break;
      case 'deleteHeader':
        this.deleteHeader(node);
        break;
      case 'deleteItem':
        this.deleteItem(node);
        break;
      case 'renameItem':
        this.renameItem(node);
        break;
      case 'addTotal':
        this.addTotalItem(node);
        break;
      case 'addEditAccounts':
        this.addEditAccounts(node);
        break;
    }
  }

  getItemLevel(node: ItemFlatNode) {
    if (this.treeType == "Engagement" || this.treeType == "Project")
      return FSBConstants.treeMenuItems.EngagementCOA.treeContextMenuOptions.filter(event => event.level == node.level);
    else if (this.treeType == "Global")
      return FSBConstants.treeMenuItems.GlobalCOA.treeContextMenuOptions.filter(event => event.level == node.level);

    return [];
  }

  addNewSubItem(node: ItemFlatNode) {
    this.AddNewSubItemEmitter.emit(node);
  }

  deleteHeader(node: ItemFlatNode) {
    this.DeleteHeaderEmitter.emit(node);
  }

  addTotalItem(node: ItemFlatNode) {
    this.AddTotalModeEmitter.emit(node);
  }

  renameItem(node: ItemFlatNode) {
    this.RenameModeEmitter.emit(node);
  }

  addNewItem(node: ItemFlatNode) {
    this.AddModeEmitter.emit(node);
  }

  deleteItem(node: ItemFlatNode) {
    this.DeleteModeEmitter.emit(node);
  }

  addEditAccounts(node: ItemFlatNode) {
    this.AddEditAccountsModeEmitter.emit(node);
  }
}
