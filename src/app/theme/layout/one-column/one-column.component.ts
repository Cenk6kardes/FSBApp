import { Component } from '@angular/core';
import { NbIconLibraries, NbMenuService } from '@nebular/theme';

@Component({
  selector: 'app-one-column-layout',
  styleUrls: ['./one-column.component.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header subheader>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar">
        <div id="logos">
          <a (click)="navigateHome()" >
          <img src="../../assets/images/logo-all.svg" id="title">
          </a>
        </div>
        <!-- <a (click)="toggleSidebar()" class="sidebar-toggle">
          <nb-icon icon="menu-2-outline"></nb-icon>
        </a> -->
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <!-- <nb-layout-footer fixed>
        <app-footer></app-footer>
      </nb-layout-footer> -->
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent {
  // constructor(private layoutService:LayoutService,private sidebarService:NbSidebarService){}
  constructor(private iconsLibrary: NbIconLibraries, private menuService: NbMenuService) {
    this.iconsLibrary.registerSvgPack('sidebar-icons', {
      'dashboard': '<img src="../../assets/images/icon-dashboard.svg" width="15px" >',
      'engagement': '<img src="../../assets/images/icon-engagement.svg" width="15px" >',
      'library': '<img src="../../assets/images/icon-library.svg" width="15px" >',
      'team': '<img src="../../assets/images/icon-team.svg" width="15px" >',
      'activity': '<img src="../../assets/images/icon-activity.svg" width="15px" >'
    }
    );
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  // toggleSidebar():boolean{
  //   this.sidebarService.toggle(true,'menu-sidebar');
  //   this.layoutService.changeLayoutSize();

  //   return false;
  // }
}
