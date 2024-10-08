import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivityChartComponent} from "./activity-chart/activity-chart.component";

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActivityComponent implements OnInit {

  @ViewChild('activityChart')activityChart: ActivityChartComponent;

  public nameCriteria = new Set<string>([]);

  constructor() {
  }

  ngOnInit(): void {
  }

  downloadReport() {
    this.activityChart.exportToExcel('activityLog');
  }

  getFilterCriteria(event: any) {
    this.nameCriteria = event.names;
  }

}
