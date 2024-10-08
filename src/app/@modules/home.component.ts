import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbAccessChecker } from '@nebular/security';
import { MENU_ITEMS } from './home-menu';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  template: `
    <app-one-column-layout>
      <nb-menu [items]="authMenu"></nb-menu>
      <router-outlet></router-outlet>
    </app-one-column-layout>
  `,
})
export class HomesComponent implements OnInit, OnDestroy {
  public authMenu = MENU_ITEMS;
  private readonly unSubscribe$ = new Subject<void>();

  constructor(
    public accessChecker: NbAccessChecker) {

  }

  //#region Lifecycle Hooks
  ngOnInit(): void {
    this.checkAuthMenu()
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
  //#endregion

  checkAuthMenu() {
    this.authMenu.forEach(menuItem => {
      this.accessChecker.isGranted('read', menuItem.data?.toString()!)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe(granted => {
          menuItem.hidden = !granted;
        });
    });
  }
}
