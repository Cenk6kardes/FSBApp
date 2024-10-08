import { Component, Input, OnInit } from '@angular/core';
import { ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';
import { BalanceSheetTreeService } from 'src/app/@core/services/balance-sheet-tree.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { CoaType, TabType } from 'src/app/shared/Infrastructure/constants/constants';

const TREE_DATA: ItemNode = new ItemNode;

@Component({
  selector: 'app-global-coa-balance-sheet',
  templateUrl: './global-coa-balance-sheet.component.html',
  styleUrls: ['./global-coa-balance-sheet.component.scss'],
  providers: [BalanceSheetTreeService]
})

export class GlobalCoaBalanceSheetComponent implements OnInit {

  data: ItemNode[];
  defaultData: ItemNode[];
  activeTab: number;
  treeType: string;
  styleType = 'balance';
  @Input() tabType: TabType;
  @Input() chartOfAccount: string;
  newGuid = () => crypto.randomUUID();

  constructor(private balanceSheetTreeService: BalanceSheetTreeService, private toastr: ToastrService) {

    this.data = [];
    this.defaultData = [];
    this.activeTab = 0;
    this.treeType = "Global";
  }

  getBalanceSheet() {
    this.balanceSheetTreeService.getBalanceSheet(this.chartOfAccount, CoaType.Global).subscribe(data => {
      if (data.length > 0) {
        this.data = Object.values(data);
      } else {
        this.setDefaultValues();
      }
    });
  }

  loadGlobal(event) {

  }

  saveBalanceSheet() {
    const obj = {
      coaid: this.chartOfAccount,
      nodeItems: this.data
    };
    this.balanceSheetTreeService.saveBalanceSheet(this.chartOfAccount, CoaType.Global).subscribe(data => {
      //this.toastr.showSuccess("Saved", '');
    });
  }

  ngOnInit(): void {
    this.getBalanceSheet();
  }

  setDefaultValues() {
    this.defaultData.push({ id: this.newGuid(), item: 'Assets', level: 0, isTotal: false } as ItemNode);
    this.defaultData[0].children = [({ id: this.newGuid(), item: 'Total Assets', level: 1, isTotal: true, children: [] } as ItemNode)];
    this.defaultData.push({ id: this.newGuid(), item: 'Liabilities', level: 0, isTotal: false } as ItemNode);
    this.defaultData[1].children = [({ id: this.newGuid(), item: 'Total Liabilities', level: 1, isTotal: true, children: [] } as ItemNode)];
    this.data = Object.values(this.defaultData);
    this.saveChanges();
  }

  saveChanges() {
    let coaT = 0;
    if (this.treeType == 'Engagement') {
      coaT = CoaType.Engagement;
    }
    else {
      coaT = CoaType.Global;
    }
    const params = {
      coaid: this.chartOfAccount,
      nodeItems: this.data
    };
    if (this.tabType == TabType.BalanceSheet) {
      this.balanceSheetTreeService.saveBalanceSheet(params, coaT).subscribe(data => {
        this.toastr.showSuccess("Saved", '');
      });
    } else if (this.tabType == TabType.IncomeStatement) {
      this.balanceSheetTreeService.saveIncomeStatement(params, coaT).subscribe(data => {
        this.toastr.showSuccess("Saved", '');
      });
    } else {
      alert("Error");
    }

  }

}





