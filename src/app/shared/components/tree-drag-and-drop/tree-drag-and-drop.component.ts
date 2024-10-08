//import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemFlatNode, ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';

@Component({
  selector: 'app-tree-drag-and-drop',
  templateUrl: './tree-drag-and-drop.component.html',
  styleUrls: ['./tree-drag-and-drop.component.scss']
})

export class TreeDragAndDropComponent {

  @Input() node: any;
  @Input() styleType: string;
  @Input() flatNodeMap: any;

  @Output() DragStartEmitter = new EventEmitter<{ event: DragEvent, node: ItemFlatNode }>();
  @Output() DragOverEmitter = new EventEmitter<{ event: DragEvent, node: ItemFlatNode }>();
  @Output() DropEmitter = new EventEmitter<{ event: DragEvent, node: ItemFlatNode }>();
  @Output() DragEndEmitter = new EventEmitter<DragEvent>();
  @Output() ChangeEmitter = new EventEmitter<any>();
  @Output() ChangeToggleEmitter = new EventEmitter<any>();
  @Output() EditTotalEmitter = new EventEmitter<any>();

  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number = 0;
  dragNodeExpandOverArea: string = "";

  checklistSelection = new SelectionModel<ItemFlatNode>(true /* multiple */);

  constructor() { }

  eventDragStart(event: DragEvent, node: ItemFlatNode) {
    this.DragStartEmitter.emit({ event, node });
  }

  eventDragOver(event: DragEvent, node: ItemFlatNode) {
    this.DragOverEmitter.emit({ event, node });
  }

  eventDrop(event: DragEvent, node: ItemFlatNode) {
    this.DropEmitter.emit({ event, node });
  }

  eventDragEnd(event: DragEvent) {
    this.DragEndEmitter.emit(event);
  }

  eventChange(node: ItemFlatNode) {
    this.ChangeEmitter.emit(node);
    this.checklistSelection.toggle(node);
  }

  eventEditTotal(node: ItemFlatNode) {
    this.EditTotalEmitter.emit(node);
  }

  returnName(node: ItemFlatNode): string {
    var itemname = this.flatNodeMap.get(node);
    return itemname.accountNumber?itemname.accountNumber + '-' + itemname.item:itemname.item    
  }
}




