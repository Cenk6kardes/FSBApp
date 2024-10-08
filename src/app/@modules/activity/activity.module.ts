import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityComponent } from './activity.component';
import { MaterialModule } from '../../shared/material/material.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import {
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbUserModule,
  NbLayoutModule, NbInputModule, NbCheckboxModule
} from "@nebular/theme";
import { ActivityChartComponent } from './activity-chart/activity-chart.component';
import {NgxDaterangepickerMd} from "ngx-daterangepicker-material";
import {MatPaginatorModule} from "@angular/material/paginator";



@NgModule({
  declarations: [
    ActivityComponent,
    ActivityChartComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    DashboardModule,
    NbSpinnerModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbFormFieldModule,
    NbUserModule,
    NbLayoutModule,
    NbInputModule,
    NbCheckboxModule,
    NgxDaterangepickerMd,
    MatPaginatorModule
  ],
})
export class ActivityModule { }
