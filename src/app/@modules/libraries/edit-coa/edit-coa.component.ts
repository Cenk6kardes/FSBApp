import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoaType, TabType } from 'src/app/shared/Infrastructure/constants/constants';

@Component({
  selector: 'app-edit-coa',
  templateUrl: './edit-coa.component.html',
  styleUrls: ['./edit-coa.component.scss']
})
export class EditCoaComponent implements OnInit {
  public element: any;
  public elementCoaType: CoaType;
  public coaType = CoaType;
  public tabType = TabType;
  public chartOfAccount: string;
  tabIndex = 0;
  constructor(private route:ActivatedRoute) {
   }

  ngOnInit(): void {
    this.element = this.route.snapshot.params;
    this.chartOfAccount = this.element.id;
    this.elementCoaType = this.element.coaid;
    localStorage.setItem('tabid',this.element.coaid)
  }

  setTab = (val: number) => {
    this.tabIndex = val;
  }
}
