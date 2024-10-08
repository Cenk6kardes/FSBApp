import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsComponent } from './teams.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { AddUserTeamsComponent } from './add-user-teams/add-user-teams.component';
import { NbButtonModule, NbCardModule, NbContextMenuModule, NbFormFieldModule, NbIconModule, NbInputModule, NbPopoverModule, NbToastrModule, NbTooltipModule, NbUserModule, NbSpinnerModule, NbTagModule } from '@nebular/theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewUserTeamsComponent } from './view-user-teams/view-user-teams.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { NbSecurityModule } from '@nebular/security';



@NgModule({
  declarations: [
    TeamsComponent,
    AddUserTeamsComponent,
    ViewUserTeamsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NbIconModule,
    NbButtonModule,
    NbCardModule,
    NbInputModule,
    NgSelectModule,
    NbUserModule,
    NbFormFieldModule,
    NbContextMenuModule,
    NbTooltipModule,
    NbPopoverModule,
    NbSpinnerModule,
    MatPaginatorModule,
    NbSecurityModule,
    NbTagModule,
  ]
})
export class TeamsModule { }
