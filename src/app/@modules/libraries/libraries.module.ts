import { SharedModule } from './../../shared/components/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalCoaBalanceSheetComponent } from './global-coa-balance-sheet/global-coa-balance-sheet.component';
import { LibrariesComponent } from './libraries.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { EngagementCoaBalanceSheetComponent } from './engagement-coa-balance-sheet/engagement-coa-balance-sheet.component';
import { EngagementCoaIncomeStatementComponent } from './engagement-coa-income-statement/engagement-coa-income-statement.component';
import { NbCardModule, NbTabsetModule, NbIconModule, NbContextMenuModule, NbInputModule, NbButtonModule, NbFormFieldModule, NbBadgeModule, NbPopoverModule, NbToggleModule, NbTooltipModule, NbSpinnerModule, NbAlertModule } from '@nebular/theme';
import { ChartOfAccountComponent } from './chart-of-account/chart-of-account.component';
import { EditCoaComponent } from './edit-coa/edit-coa.component';
import { LibrariesRoutingModule } from './libraries-routing.module';
import { GlobalCoaIncomeStatementComponent } from './global-coa-income-statement/global-coa-income-statement.component';
import { AddCoaDialogComponent } from './add-coa-dialog/add-coa-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddAccountDialogComponent } from 'src/app/shared/components/add-account-dialog/add-account-dialog.component';
import {MatPaginatorModule} from "@angular/material/paginator";


@NgModule({
  declarations: [
    GlobalCoaBalanceSheetComponent,
    LibrariesComponent,
    EngagementCoaBalanceSheetComponent,
    EngagementCoaIncomeStatementComponent,
    ChartOfAccountComponent,
    EditCoaComponent,
    GlobalCoaIncomeStatementComponent,
    AddCoaDialogComponent,
    AddAccountDialogComponent
  ],
    imports: [
        CommonModule,
        MaterialModule,
        NbCardModule,
        NbTabsetModule,
        NbContextMenuModule,
        NbIconModule,
        NbInputModule,
        NbButtonModule,
        NbFormFieldModule,
        NbBadgeModule,
        NbPopoverModule,
        NbToggleModule,
        NbAlertModule,
        LibrariesRoutingModule,
        NbTooltipModule,
        NgSelectModule,
        NbSpinnerModule,
        SharedModule,
        MatPaginatorModule
    ]
})
export class LibrariesModule { }
