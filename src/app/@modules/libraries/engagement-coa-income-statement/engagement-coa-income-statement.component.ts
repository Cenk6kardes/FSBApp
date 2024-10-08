import { Component, Input, OnInit } from '@angular/core';
import { ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';
import { BalanceSheetTreeService } from 'src/app/@core/services/balance-sheet-tree.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { CoaType, TabType } from 'src/app/shared/Infrastructure/constants/constants';

const TREE_DATA: any = [
  {
    item: 'Income Engagement',
    children: [
      {
        item: 'Revenue',
        children: [
          { item: 'Sales revenue' },
          { item: '(Lees sales returns and allowences)' },
          { item: 'Service revenue' },
          { item: 'Interest revenue' }]
      }
    ],
  },
  {
    item: 'Expenses',
    children: [
      {
        item: 'Cost of Goods Sold',
        children: [
          { item: 'Beginning inventory' },
          { item: 'Goods purchased' },
          { item: 'Goods manufactured: Raw materials' },
          { item: 'Goods manufactured: Direct Labor' },
          { item: 'Total Goods Available' },
          { item: '(Lees ending inventory)' }]
      },
      {
        item: 'Expenses',
        children: [
          { item: 'Advertising' },
          { item: 'Bad debt' },
          { item: 'Commissions' },
          { item: 'Depreciation' },
          { item: 'Employee benefits' },
          { item: 'Furniture and equipment' },
          { item: 'Insurance' },
          { item: 'Interest expense' },
          { item: 'Maintenace and repairs' },
          { item: 'Office supplies' },
          { item: 'Payroll taxes' },
          { item: 'Rent' },
          { item: 'Salaries and wages' },
          { item: 'Software' },
          { item: 'Travel' },
          { item: 'Utilities' },
          { item: 'Web hosting and domains' },
          { item: 'Other Expenses' }]
      }
    ],
  },
];

@Component({
  selector: 'app-engagement-coa-income-statement',
  templateUrl: './engagement-coa-income-statement.component.html',
  styleUrls: ['./engagement-coa-income-statement.component.scss'],
  providers: [BalanceSheetTreeService]
})
export class EngagementCoaIncomeStatementComponent implements OnInit {

  data: ItemNode[];
  defaultData: ItemNode[];
  activeTab: number;
  treeType: string;
  styleType = 'income';
  //chartOfAccount: string;
  @Input() tabType: TabType;
  @Input() chartOfAccount: string;
  newGuid = () => crypto.randomUUID();

  constructor(private balanceSheetTreeService: BalanceSheetTreeService, private toastr: ToastrService) {
    this.data = [];
    this.defaultData = [];
    this.activeTab = 0;
    this.treeType = "Engagement";
    //this.chartOfAccount = "318E8002-B2C7-48BF-8742-BA812D0D62B0";
  }

  getIncomeStatement() {

    this.balanceSheetTreeService.getIncomeStatement(this.chartOfAccount, CoaType.Engagement).subscribe(data => {
      if (data.length > 0) {
        this.data = Object.values(data);
      } else {
        this.setDefaultValues();
      }
    });
  }

  saveIncomeStatement() {
    const obj = {
      coaid: this.chartOfAccount,
      nodeItems: this.data
    };
    this.balanceSheetTreeService.saveIncomeStatement(this.chartOfAccount, CoaType.Engagement).subscribe(data => {
      //this.toastr.showSuccess("Saved", '');
    });
  }

  ngOnInit(): void {
    this.getIncomeStatement();
  }

  setDefaultValues() {
    this.defaultData.push({ id: this.newGuid(), item: 'Income', level: 0, isTotal: false } as ItemNode);
    this.defaultData[0].children = [({ id: this.newGuid(), item: 'Total Income', level: 1, isTotal: true, children: [] } as ItemNode)];
    this.defaultData.push({ id: this.newGuid(), item: 'Expenses', level: 0, isTotal: false } as ItemNode);
    this.defaultData[1].children = [({ id: this.newGuid(), item: 'Total Expenses', level: 1, isTotal: true , children: []} as ItemNode)];
    this.defaultData.push({ id: this.newGuid(), item: 'Net Profit (Loss)', level: 0, isTotal: true, children: [] } as ItemNode);
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
