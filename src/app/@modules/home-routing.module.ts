import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomesComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntityComponent } from './entity/entity.component';
import { TeamsComponent } from './teams/teams.component';
import { ActivityComponent } from './activity/activity.component';
import { LibrariesComponent } from './libraries/libraries.component';

const routes: Routes = [
  {
    path: '',
    component: HomesComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then((l) => l.DashboardModule),
      },
      {
        path: 'entityscreen',
        component: EntityComponent,
      },
      {
        path: 'libraries',
        component: LibrariesComponent,
        loadChildren: () =>
          import('./libraries/libraries.module').then((l) => l.LibrariesModule),
      },
      {
        path: 'team',
        component: TeamsComponent,
      },
      {
        path: 'activity',
        component: ActivityComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        component: DashboardComponent, //NotFoundComponent
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutesModule {}
