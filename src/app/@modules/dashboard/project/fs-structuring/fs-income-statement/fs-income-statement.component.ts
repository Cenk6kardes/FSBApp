import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { BalanceSheetTreeService } from 'src/app/@core/services/balance-sheet-tree.service';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { ProjectService } from 'src/app/@core/services/project/project.service';
import { CatalogService } from 'src/app/@core/services/shared/catalog/catalog.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { TabType } from 'src/app/shared/Infrastructure/constants/constants';

@Component({
  selector: 'app-fs-income-statement',
  templateUrl: './fs-income-statement.component.html',
  styleUrls: ['./fs-income-statement.component.scss'],
  providers: [BalanceSheetTreeService]
})
export class FsIncomeStatementComponent implements OnInit {

  tabIndex = 0;
  data: any[];
  tabType: any;
  treeType: any;
  chartOfAccount: any;
  styleType = 'income';
  constructor(
    private balanceSheetTreeService: BalanceSheetTreeService, private _route: ActivatedRoute
  ) {
    this.tabType = TabType.ProjectIncomeStatement;
    this.treeType = "Project";
    this.chartOfAccount = "";
  }

  ngOnInit(): void {
    this._route.params.subscribe((params: Params) => {
      this.chartOfAccount = params['id'];
      this.getFsStructuring(this.chartOfAccount);
    });
  }

  getFsStructuring(projectId: string) {
    this.balanceSheetTreeService.getProjectFsStructuring(projectId, TabType.ProjectIncomeStatement).subscribe(data => {
      if (data.length > 0) {
        this.data = Object.values(data);
      }
    });
  }

  setTab = (val: number) => {
    this.tabIndex = val;
  }

}
