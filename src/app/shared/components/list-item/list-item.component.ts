import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit {
  @Input() content: any;
  @Input() index: any;
  collapsableItem: number = -1;
  constructor() {}

  ngOnInit(): void {
  }

  collapseItem(index: number) {
    if (index == this.collapsableItem) {
      this.collapsableItem = -1;
    } else {
      this.collapsableItem = index;
    }
  }
}
