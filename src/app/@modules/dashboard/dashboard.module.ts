import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { ProjectsOverviewComponent } from './projects-overview/projects-overview.component';
import { NotesComponent } from './notes/notes.component';
import { MaterialModule } from '../../shared/material/material.module';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbContextMenuModule,
  NbDatepickerModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbListModule,
  NbPopoverModule,
  NbProgressBarModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbUserModule,
} from '@nebular/theme';
import { OverviewCardComponent } from 'src/app/shared/components/overview-card/overview-card.component';
import { ListItemComponent } from 'src/app/shared/components/list-item/list-item.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { EditNoteComponent } from './notes/edit-note/edit-note.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ProjectComponent } from './project/project.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ProjectSettingsComponent } from './project/project-settings/project-settings.component';
import { ProjectSetupModule } from './project-setup/project-setup.module';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { StatusBarComponent } from './project/status-bar/status-bar.component';
import { ProjectBalanceProcessingComponent } from './project/project-balance-processing/project-balance-processing.component';
import { ProjectBalanceTableComponent } from './project/project-balance-processing/project-balance-table/project-balance-table.component';
import { NbSecurityModule } from '@nebular/security';
import { StatusChangeDialogComponent } from 'src/app/shared/components/status-change-dialog/status-change-dialog.component';
import { FsStructuringComponent } from './project/fs-structuring/fs-structuring.component';
import { FsBalanceSheetComponent } from './project/fs-structuring/fs-balance-sheet/fs-balance-sheet.component';
import { FsIncomeStatementComponent } from './project/fs-structuring/fs-income-statement/fs-income-statement.component';
import { SharedModule } from 'src/app/shared/components/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProjectDashboardComponent } from './project/project-dashboard/project-dashboard.component';
import { TBUploadStatusComponent } from './project/project-dashboard/tb-upload-status/tb-upload-status.component';
import { CurrencyDirective } from './directives/currency.directive';
import { ProjectActivityComponent } from './project-activity/project-activity.component';
import { ActivityCheckPipe } from './pipes/activity-check.pipe';
import { NgxPrintModule } from 'ngx-print';
import { ProjectFilterComponent } from './project-filter/project-filter.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ProjectsOverviewComponent,
    NotesComponent,
    ProjectActivityComponent,
    OverviewCardComponent,
    ListItemComponent,
    ProjectTableComponent,
    EditNoteComponent,
    ProjectComponent,
    ProjectSettingsComponent,
    ConfirmDialogComponent,
    StatusBarComponent,
    ConfirmDialogComponent,
    ProjectBalanceProcessingComponent,
    ProjectBalanceTableComponent,
    StatusChangeDialogComponent,
    FsStructuringComponent,
    FsBalanceSheetComponent,
    FsIncomeStatementComponent,
    ProjectDashboardComponent,
    TBUploadStatusComponent,
    CurrencyDirective,
    ActivityCheckPipe,
    ProjectFilterComponent
  ],
  imports: [
    CommonModule,
    NgxPrintModule,
    DashboardRoutingModule,
    MaterialModule,
    NbCardModule,
    NbProgressBarModule,
    NbSelectModule,
    NbDatepickerModule,
    NbContextMenuModule,
    NbTabsetModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbUserModule,
    NbLayoutModule,
    NgxDaterangepickerMd,
    NbCheckboxModule,
    NbPopoverModule,
    DashboardRoutingModule,
    ProjectSetupModule,
    NbSpinnerModule,
    NbSecurityModule,
    SharedModule,
    MatPaginatorModule,
  ],
  providers: [DatePipe, CurrencyPipe],
})
export class DashboardModule { }
