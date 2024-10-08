export default interface IItemNode {
  children: ItemNode[];
  item: string;
  id: any;
  parentID: any;
  level: number;
  isTotal: boolean;
  accountNumber: string;
}

export class ItemNode implements IItemNode {
  children: any;
  parentID: any;
  item: any;
  id: any;
  level: any;
  isTotal: any;
  accountNumber: string;
}

export interface IItemFlatNode {
  id: any;
  item: string;
  level: number;
  expandable: boolean;
  editMode: boolean;
  isTotal: boolean;
}
export class ItemFlatNode implements IItemFlatNode {
  id: any;
  item: any;
  level: any;
  expandable: any;
  editMode: any;
  isTotal: boolean;
}



export class IEventAction {
  event!: DragEvent;
  node!: IItemFlatNode;
}

export class EventAction implements IEventAction {
  event!: DragEvent;
  node!: IItemFlatNode;
}

export class IAccountModel {
  id: any;
  name: string;
  description: string;
}

export class AccountModel implements IAccountModel {
  id: any;
  name: any;
  description: any;
}