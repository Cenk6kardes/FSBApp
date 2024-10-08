import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { APIDefinition, API } from 'ngx-easy-table';
import {CoaType, OperationType} from '../../shared/Infrastructure/constants/constants';
import {ChartOfAccountComponent} from "./chart-of-account/chart-of-account.component";

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.component.html',
  styleUrls: ['./libraries.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibrariesComponent implements OnInit,OnDestroy {

  @ViewChild('coaEngagement')coaEngagement: ChartOfAccountComponent;
  @ViewChild('coaGlobal')coaGlobal: ChartOfAccountComponent;

  tableCoa!: APIDefinition;
  tableEng!: APIDefinition;
  typeSelected!: CoaType;
  routerActive: boolean = false;
  searchInput = new FormControl('')

  coaType = CoaType;
  localStorage=localStorage;

  constructor() { }


  ngOnInit(): void {
  }

  doSomeWithSelected(evt){
    // this.router.navigate(['home/libraries/edit', evt.id, evt.name]);
  }

  onChangeTab(evt) {
    this.typeSelected = evt.tabId;
    this.onChangeSearch();
  }

  onChangeSearch(): void {
    if (this.typeSelected == this.coaType.Global)
      this.tableCoa.apiEvent({
        type: API.onGlobalSearch,
        value: this.searchInput.value!,
      });

    if (this.typeSelected == this.coaType.Engagement)
      this.tableEng.apiEvent({
        type: API.onGlobalSearch,
        value: this.searchInput.value!,
      });
  }

  setTableCoaSearch(evt) {
    this.tableCoa = evt;
  }

  setTableEngCoaSearch(evt) {
    this.tableEng = evt;
  }

  onActivate(evt: Event){
    this.routerActive = true;
  }

  onDeactivate(evt:Event){
    this.routerActive = false;
  }

  openDialog(opType: OperationType, title: string){
    if(title === 'Engagement COA'){
      this.coaEngagement.title = title;
      this.coaEngagement.openDialog(opType);
    }
    else if (title === 'Global COA'){
      this.coaGlobal.title = title;
      this.coaGlobal.openDialog(opType);
    }
  }

  ngOnDestroy(): void {
    localStorage.removeItem('tabid')
  }

}
