import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-two-columns',
  styleUrls: ['./two-columns.component.scss'],
  template: `<nb-layout windowMode>
  <nb-layout-header fixed>
    <app-header></app-header>
  </nb-layout-header>

  <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
    <ng-content select="nb-menu"></ng-content>
  </nb-sidebar>

  <nb-layout-column>
    <!-- <ng-content select="{{selectorColumn1}}"></ng-content> -->
  </nb-layout-column>

  <nb-layout-column>
    <ng-content select="router-outlet"></ng-content>
  </nb-layout-column>

  <nb-layout-footer fixed>
    <app-footer></app-footer>
  </nb-layout-footer>

</nb-layout>`
})
export class TwoColumnsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
