import { Component, Input, OnInit } from '@angular/core';
import { ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';
import { BalanceSheetTreeService } from 'src/app/@core/services/balance-sheet-tree.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { CoaType, TabType } from 'src/app/shared/Infrastructure/constants/constants';

const TREE_DATA: any = [
  {
    id: '626fd535-f76d-42a0-a44f-080205f737ea',
    item: 'Assets',
    children: [
      {
        id: '626fd535-f76d-42a0-a44f-080205f737eb',
        item: 'Property plant and equipment',
        children: [
          { id: '626fd535-f76d-42a0-a44f-080205f737ec', item: 'Property, plant and equipment, net' },
          { id: '626fd535-f76d-42a0-a44f-080205f737ed', item: 'Property, plant and equipment, gross' },
          { id: '626fd535-f76d-42a0-a44f-080205f737ee', item: 'PPE accumulated deprecation' }]
      },
      {
        id: '626fd535-f76d-42a0-a44f-080205f737ef',
        item: 'Intangible assets and goodwill',
        children: [
          {
            id: '626fd535-f76d-42a0-a44f-080205f737eg',
            item: 'Intangible assets - acquired',
            children: [
              { id: '626fd535-f76d-42a0-a44f-080205f737eh', item: '100201-patents' },
              { id: '626fd535-f76d-42a0-a44f-080205f737ei', item: '100202-Brands Acquisition' }]
          },
          { id: '626fd535-f76d-42a0-a44f-080205f737ej', item: 'Intangible assets - internally generated' }],
      },
      {
        id: '626fd535-f76d-42a0-a44f-080205f737ek',
        item: 'Investments',
        children: [
          { id: '626fd535-f76d-42a0-a44f-080205f737el', item: 'Investments-1' },
          { id: '626fd535-f76d-42a0-a44f-080205f737em', item: 'Investments-2' }],
      },
    ],
  },
];

@Component({
  selector: 'app-engagement-coa-balance-sheet',
  templateUrl: './engagement-coa-balance-sheet.component.html',
  styleUrls: ['./engagement-coa-balance-sheet.component.scss'],
  providers: [BalanceSheetTreeService]
})
export class EngagementCoaBalanceSheetComponent implements OnInit {

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
    this.treeType = "Engagement";
  }

  ngOnInit(): void {
    //this.chartOfAccount =
    this.getBalanceSheet();
  }

  getBalanceSheet() {

    this.balanceSheetTreeService.getBalanceSheet(this.chartOfAccount, CoaType.Engagement).subscribe(data => {
      if (data.length > 0) {
        this.data = Object.values(data);
      } else {
        this.setDefaultValues();
      }
    });
  }

  saveBalanceSheet() {
    const obj = {
      coaid: this.chartOfAccount,
      nodeItems: this.data
    };
    this.balanceSheetTreeService.saveBalanceSheet(this.chartOfAccount, CoaType.Engagement).subscribe(data => {
      //this.toastr.showSuccess("Saved", '');
    });
  }

  setDefaultValues() {
    this.defaultData.push({ id: this.newGuid(), item: 'Assets', level: 0, isTotal: false } as ItemNode);
    this.defaultData[0].children = [({ id: this.newGuid(), item: 'Total Assets', level: 1, isTotal: true } as ItemNode)];
    this.defaultData.push({ id: this.newGuid(), item: 'Liabilities', level: 0, isTotal: false } as ItemNode);
    this.defaultData[1].children = [({ id: this.newGuid(), item: 'Total Liabilities', level: 1, isTotal: true } as ItemNode)];
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
