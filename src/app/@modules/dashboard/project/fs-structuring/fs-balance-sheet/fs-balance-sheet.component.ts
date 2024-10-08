import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { BalanceSheetTreeService } from 'src/app/@core/services/balance-sheet-tree.service';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { ProjectService } from 'src/app/@core/services/project/project.service';
import { CatalogService } from 'src/app/@core/services/shared/catalog/catalog.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { CoaType, TabType } from 'src/app/shared/Infrastructure/constants/constants';

const TREE_DATA: any = [
  {
    "id": "f50bdb79-78c7-45b1-8442-16b59e31eba4",
    "parentID": null,
    "item": "Assets",
    "level": 0,
    "isTotal": false,
    "children": [
      {
        "id": "389b440c-b28f-4adc-820e-10627a1703a9",
        "parentID": "f50bdb79-78c7-45b1-8442-16b59e31eba4",
        "item": "cash & equivalents",
        "level": 1,
        "isTotal": false,
        "children": [
          {
            "id": "e319a833-8512-441e-849a-407319e7ada4",
            "parentID": "389b440c-b28f-4adc-820e-10627a1703a9",
            "item": "non-trade receivables",
            "level": 2,
            "isTotal": false,
            "children": []
          }
        ]
      },
      {
        "id": "e7e06e30-20c3-4f6e-ac49-2b93a80a7761",
        "parentID": "f50bdb79-78c7-45b1-8442-16b59e31eba4",
        "item": "Marketable securities",
        "level": 1,
        "isTotal": false,
        "children": [
          {
            "id": "62e39f5d-2b53-4a7b-bef5-2cfce86a38b4",
            "parentID": "e7e06e30-20c3-4f6e-ac49-2b93a80a7761",
            "item": "property, plant and equipment",
            "level": 2,
            "isTotal": false,
            "children": []
          }
        ]
      },
      {
        "id": "b61e1db2-5011-4974-af5f-67140655b4c6",
        "parentID": "f50bdb79-78c7-45b1-8442-16b59e31eba4",
        "item": "Current assets",
        "level": 1,
        "isTotal": false,
        "children": []
      },
      {
        "id": "9d0b3606-f9ca-4675-87be-d45fd9bb7901",
        "parentID": "f50bdb79-78c7-45b1-8442-16b59e31eba4",
        "item": "Inventories",
        "level": 1,
        "isTotal": false,
        "children": [
          {
            "id": "c8a7a1d5-dfd2-412d-9420-74285ee93aa1",
            "parentID": "9d0b3606-f9ca-4675-87be-d45fd9bb7901",
            "item": "accounts",
            "level": 2,
            "isTotal": false,
            "children": []
          }
        ]
      }
    ]
  },
  {
    "id": "b301f0dc-16f8-421c-8bc4-27ebdb214fc1",
    "parentID": null,
    "item": "Equities",
    "level": 0,
    "isTotal": false,
    "children": [
      {
        "id": "eda89dd5-3d95-4b38-b40c-0435e22d2aea",
        "parentID": "b301f0dc-16f8-421c-8bc4-27ebdb214fc1",
        "item": "Inventories",
        "level": 1,
        "isTotal": false,
        "children": [
          {
            "id": "679f8941-64d7-4bf8-bf9c-0671d30c66fd",
            "parentID": "eda89dd5-3d95-4b38-b40c-0435e22d2aea",
            "item": "hey",
            "level": 2,
            "isTotal": false,
            "children": []
          },
          {
            "id": "c17917cf-1aad-4909-ab13-801e9b27f21c",
            "parentID": "eda89dd5-3d95-4b38-b40c-0435e22d2aea",
            "item": "Total",
            "level": 2,
            "isTotal": true,
            "children": []
          }
        ]
      },
      {
        "id": "c094d7ba-977f-46db-929a-94902c88c47d",
        "parentID": "b301f0dc-16f8-421c-8bc4-27ebdb214fc1",
        "item": " ",
        "level": 1,
        "isTotal": false,
        "children": []
      }
    ]
  },
  {
    "id": "67a92b10-94b9-4fe5-9366-5593104d49ae",
    "parentID": null,
    "item": "Liabilities",
    "level": 0,
    "isTotal": false,
    "children": [
      {
        "id": "a4804469-2179-4eab-b3c8-41724a80808d",
        "parentID": "67a92b10-94b9-4fe5-9366-5593104d49ae",
        "item": "Non-Current",
        "level": 1,
        "isTotal": false,
        "children": [
          {
            "id": "207c1968-2e74-48e4-915c-0da5b3bf6f4e",
            "parentID": "a4804469-2179-4eab-b3c8-41724a80808d",
            "item": "Term debt",
            "level": 2,
            "isTotal": false,
            "children": []
          },
          {
            "id": "d9f6dcef-579d-4ac7-aabe-c0ac64c708d8",
            "parentID": "a4804469-2179-4eab-b3c8-41724a80808d",
            "item": "Total",
            "level": 2,
            "isTotal": true,
            "children": []
          },
          {
            "id": "86b2996e-66be-4b1b-ab83-ccf4b4414c24",
            "parentID": "a4804469-2179-4eab-b3c8-41724a80808d",
            "item": "Other non-current liabilities",
            "level": 2,
            "isTotal": false,
            "children": []
          }
        ]
      },
      {
        "id": "02fecf79-6556-44ee-a53b-b574f8a17656",
        "parentID": "67a92b10-94b9-4fe5-9366-5593104d49ae",
        "item": "Current",
        "level": 1,
        "isTotal": false,
        "children": [
          {
            "id": "20758509-3720-4d7c-aab4-19f3c71e5454",
            "parentID": "02fecf79-6556-44ee-a53b-b574f8a17656",
            "item": "Deferred revenue",
            "level": 2,
            "isTotal": false,
            "children": []
          },
          {
            "id": "247f30fc-3fea-4bef-bbd4-9774da0bda95",
            "parentID": "02fecf79-6556-44ee-a53b-b574f8a17656",
            "item": "Total",
            "level": 2,
            "isTotal": true,
            "children": []
          },
          {
            "id": "e627d1ac-6589-4753-8c56-aa8b0564ec22",
            "parentID": "02fecf79-6556-44ee-a53b-b574f8a17656",
            "item": "Accounts payable",
            "level": 2,
            "isTotal": false,
            "children": []
          },
          {
            "id": "4dee9c73-9cfc-4205-b98b-bb9eff6cc185",
            "parentID": "02fecf79-6556-44ee-a53b-b574f8a17656",
            "item": "commercial paper",
            "level": 2,
            "isTotal": false,
            "children": []
          }
        ]
      }
    ]
  }]
@Component({
  selector: 'app-fs-balance-sheet',
  templateUrl: './fs-balance-sheet.component.html',
  styleUrls: ['./fs-balance-sheet.component.scss'],
  providers: [BalanceSheetTreeService]
})


export class FsBalanceSheetComponent implements OnInit {

  data: any[];
  tabType: any;
  treeType: any;
  styleType = 'balance';
  chartOfAccount: any;
  constructor(private balanceSheetTreeService: BalanceSheetTreeService, private _route: ActivatedRoute
  ) {
    this.tabType = TabType.ProjectBalanceSheet;
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
    this.balanceSheetTreeService.getProjectFsStructuring(projectId, TabType.ProjectBalanceSheet).subscribe(data => {
      if (data.length > 0) {
        this.data = Object.values(data);
      }
    });
  }



}
