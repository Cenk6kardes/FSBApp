import { FormatOptions } from './../../interfaces/balance-process.interface';
import { Component, OnInit, OnDestroy, ViewChild, HostListener, Inject } from '@angular/core';
import { NbDialogService, NbMenuService } from '@nebular/theme';
import { Subject, takeUntil, filter } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  BalanceSource,
  PeriodBreak,
} from '../../interfaces/balance-process.interface';
import { ProjectBalanceTableComponent } from './project-balance-table/project-balance-table.component';
import { ActivityService } from 'src/app/@core/services/activity/activity.service';
import { ActivityCodes, FSBConstants } from 'src/app/shared/Infrastructure/constants/constants';

@Component({
  selector: 'app-project-balance-processing',
  templateUrl: './project-balance-processing.component.html',
  styleUrls: ['./project-balance-processing.component.scss'],
})
export class ProjectBalanceProcessingComponent implements OnInit, OnDestroy {
  @ViewChild(ProjectBalanceTableComponent) child: ProjectBalanceTableComponent;
  private readonly unSubscribe$ = new Subject<void>();

  balanceSource = BalanceSource.ManualEntry;
  periodBreak: PeriodBreak;
  rollForward: boolean;
  tempBalanceSource = BalanceSource.ManualEntry;
  projectID: string;
  projectName!: string;
  activeTab: string = 'Balance Sheet';
  writeDocArr: any[] = [];
  status: string = '';
  financialYear: string = '';
  setTotalAreaMap = [];
  data: any[] = [];
  options = [
    { title: FormatOptions.GL_Format },
    { title: FormatOptions.FS_Format },
  ];

  balances = [BalanceSource.ManualEntry, BalanceSource.TrialBalanceUpload];
  periods = [
    PeriodBreak.Annually,
    PeriodBreak.HalfYearly,
    PeriodBreak.Quarterly,
    PeriodBreak.Monthly,
  ];

  constructor(
    protected _dashService: DashboardService,
    private _dialogService: NbDialogService,
    private _nbMenuService: NbMenuService,
    private activityService: ActivityService
  ) { }

  ngOnInit(): void {
    this._dashService.pd
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((details) => {
        this.financialYear = details.financialYear + '';
        this.status = details.status;
        this.periodBreak = details.periodBreak.name;
        this.rollForward = details.projectType.name.includes('Roll');
        this.projectID = details.id;
        this.projectName = details.entity.name + '_' + details.financialYear;
        this.balanceSource=details.balanceSource;
        this.tempBalanceSource=details.balanceSource;
      });
    this.menuListener();
    this.listenPeriod();
  }

  upload(glFormat: boolean) {
    this._dialogService
      .open(ConfirmDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Confirm Changes',
          text: '<h3>Upload TB Can Result in Data Loss. <br> <b>Do You Confirm?</b></h3>',
          modalType: 'warning',
        },
      })
      .onClose.subscribe((data) => {
        if (data.confirm) {
          this.child.upload(glFormat);
        }
      });
  }

  download(glFormat: boolean) {
    this.child.download(glFormat);
  }  
    
  expandTree() {
    this.child.expandTree();
  }

  collapseTree() {
    this.child.collapseTree();
  }

  changeBalanceSource(balanceSource) {
    if(this.balanceSource != balanceSource){
      this._dialogService
      .open(ConfirmDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Confirm Changes',
          text: '<h3>Are you sure you want to change this Balance Source?<br><b>Once changed, existing data may be lost.</b></h3>',
          modalType: 'warning',
        },
      })
      .onClose.subscribe((data) => {
        if (data.confirm) {
          this.balanceSource = this.tempBalanceSource;
        } else {
          this.tempBalanceSource = this.balanceSource;
        }
      });  
    }     
  }

  menuListener() {
    this._nbMenuService
      .onItemClick()
      .pipe(
        takeUntil(this.unSubscribe$),
        filter(({ tag }) => tag === 'download' || tag === 'upload')
      )
      .subscribe((item) => {
        let glFormat = item.item.title === FormatOptions.GL_Format;
        if (item.tag === 'download') {
          this.download(glFormat);
        } else {
          this.upload(glFormat);
        }
      });
  }
  onTabSelected = (event: any) => {
    this.activeTab = event.value;
  }

  onDataTypeChanged = (event: any) => {
    this.writeDocArr = [];
    this.writeData(event.data, 0, null, event.data);
    this.data = event.data;
    
    this.writeDocArr.filter((item: any) => {
      return item.level === 2;
    }).map((val: any) => {
      const totalVal =  this.writeDocArr.filter( (value:any) => {
        return value.parentId === val.id;
      }).map(((item: any) => {
        return item.total;
      }));
      if(val.total === 0){
        val.total = totalVal.length > 0 ? totalVal[0] : 0;
      }
      return val;
    });
  }

  writeData = (data: any, level: number, parentId: null | string, mainData: any) => {
    if (data !== undefined && data.length > 0) {
      for (let i = 0; i < data.length; ++i) {
        const total = data[i].columns.reduce((accumulator, item) => accumulator + parseInt(item.amount) || 0, 0);
        if (data[i].item !== '') {
          if (data[i].isTotal) {
            if (data[i].item === 'Net Profit' || data[i].item === 'Net Profit (Loss)') {
              this.writeDocArr.push({ name: data[i].item, level: level, total: total, parentId: parentId, id: data[i].id, istotal: true });
            } else {
              this.writeDocArr.push({ name: data[i].item, level: level, total: total, parentId: parentId, id: data[i].id, istotal: true });
            }

          } else {
            this.writeDocArr.push({ name: data[i].item, level: level, total: total, parentId: parentId, id: data[i].id });
          }
        }
        this.writeData(data[i].children, level + 1, data[i].id, mainData);
      }
    } else {
      return
    }
  }

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.unsubscribe();
  }

  listenPeriod() {
    this._dashService.periodBreak
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((res) => {
        this.periodBreak = res;
      });
  }

  printActionSave = () => {
    const log: any = {
      "actionType": ActivityCodes.Print,
      "activityTitle": FSBConstants.ActivityList.FsPrint.activity,
      "activityDescription": FSBConstants.ActivityList.FsPrint.description.replace('{0}', this.projectName),
      "projectId": this.projectID,
      "moduleId": 'ED3B62FF-E7B8-4122-8E3B-5E0E6F104F17',
      "projectStatus": this.status

    }
    this.activityService.saveActivityLog(log).subscribe(result => {
    })
  }

  getTotal = (item: any) => {
    let val = this.writeDocArr.filter((val: any) => {
      return val.parentId == item.parentId
    }).reduce((acc, item: any) =>
      acc + this.writeDocArr.filter((value: any) => {
        return item.id === value.parentId
      }).reduce((accumulator, item: any) => accumulator + item.total, 0), 0);
    this.setTotalToParentNode(item, val);
    return val;
  }

  setTotalToParentNode = (item: any, val) => {
    let parent = this.writeDocArr.find((val: any) => {
      return val.id == item.parentId
    });
    if (parent) {
      parent.totalCost = val;
    }
  }

  getDifference() {
    const revenue = this.writeDocArr.find((val: any) => {
      return val.id === this.data[0].id
    })
    const expenses = this.writeDocArr.find((val: any) => {
      return val.id === this.data[1].id
    })
    if (expenses && revenue) {
      return revenue.totalCost - expenses.totalCost;
    } else {
      return 0;
    }
  }

  numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.00';
  }
}
