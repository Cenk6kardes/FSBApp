import { NgModule } from '@angular/core';
import { HomesComponent } from './home.component';
import { NbSidebarModule, NbLayoutModule, NbButtonModule, NbMenuModule, NbToastrModule, NbDialogModule } from '@nebular/theme';
import { HomeRoutesModule } from './home-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ThemeModule } from '../theme/theme.module';
import { EntityModule } from './entity/entity.module';
import { TeamsModule } from './teams/teams.module';
import { ActivityModule } from './activity/activity.module';
import { LibrariesModule } from './libraries/libraries.module';

const FSB_MODULES = [
  ThemeModule.forRoot(),
  HomeRoutesModule,
  DashboardModule,
  EntityModule,
  TeamsModule,
  ActivityModule,
  LibrariesModule
];

const NEBULAR_MODULES = [
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbMenuModule,
  NbDialogModule.forChild()
];
@NgModule({
  declarations: [
    HomesComponent,
  ],
  imports: [
    ...FSB_MODULES,
    ...NEBULAR_MODULES,
  ],
  exports: [HomesComponent],
})
export class HomesModule { }
