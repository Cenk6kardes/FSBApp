import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { ProjectDashboardService } from 'src/app/@core/services/project-dashboard/project-dashboard.service';

@Component({
  selector: 'app-tb-upload-status',
  templateUrl: './tb-upload-status.component.html',
  styleUrls: ['./tb-upload-status.component.scss']
})
export class TBUploadStatusComponent implements OnInit {


  TBUploadStatusType: string = 'Monthly';
  columnStatus: any;

  Months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
    'November', 'December'];

  Quarters: string[] = ['1 Quarter', '2 Quarter', '3 Quarter', '4 Quarter']

  HalfYear: string[] = [`${2000} Jan - Jun`, '2022 Jul — Dec']

  AnnualTime: string[] = ['2022 Year']

  constructor(private projectDashboardService: ProjectDashboardService, private _dashService: DashboardService
  ) { }

  ngOnInit(): void {
    this.projectDashboardService.startTBUploadStatusConnection();
    this.projectDashboardService.getTBUploadStatusListener();
    this._dashService.projectDetails.pipe()
      .subscribe(details => {
        if (details.id) {
          this.HalfYear[0] = `${details.financialYear} Jan - Jun`;
          this.HalfYear[1] = `${details.financialYear} Jul - Dec`;
          this.AnnualTime[0] = `${details.financialYear} Year`
        }
      })
    this.projectDashboardService.tbUploadStatusHub.subscribe(
      data => {
        if (data.ColumnStatus) {
          this.TBUploadStatusType = data.PeriodBreakName;
          this.columnStatus = Object.keys(data.ColumnStatus).map((item: any) => {
            return { key: item, selected: data.ColumnStatus[item] }
          });
        }
      }
    )
  }

}
