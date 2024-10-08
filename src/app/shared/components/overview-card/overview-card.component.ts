import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IFilterItems } from 'src/app/@modules/dashboard/interfaces/filter-items.interface';
import { IStatusItems } from 'src/app/@modules/dashboard/interfaces/status-items.interface';

@Component({
  selector: 'app-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.scss'],
})
export class OverviewCardComponent {
  @Input() content: IFilterItems;
  @Input() statusContent: IStatusItems;
  @Input() index: number;
  @Input() clickedClass: string;
  @Input() type: string;
  @Output() filterEvent?: any = new EventEmitter();

  constructor() { }

  setFilter = (value: any, type: string) => {
    this.filterEvent.emit({ filterType: { ...value, category: type } })
  }
}
