import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { IFilterItems } from '../interfaces/filter-items.interface';
import { IStatusItems } from '../interfaces/status-items.interface';

@Component({
  selector: 'app-projects-overview',
  templateUrl: './projects-overview.component.html',
  styleUrls: ['./projects-overview.component.scss'],
})
export class ProjectsOverviewComponent implements OnInit {
  @Input() filterItems!: IFilterItems[];
  @Input() statusItems!: IStatusItems[];
  @Output() filterEvent?: any = new EventEmitter();

  constructor(private _dashService: DashboardService) { }

  ngOnInit(): void { }

  filterClick(item: IFilterItems) {
    this.filterItems.forEach((element) => {
      element.checked = false;
    });
    item.checked = true;
    this._dashService.updateItemUI(item.status);
  }

  onFilterFired = (data: any) => {
    this.filterEvent.emit({filterType: data.filterType})
  }
}
