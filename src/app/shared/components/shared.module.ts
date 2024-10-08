import { BalanceSheetTreeService } from 'src/app/@core/services/balance-sheet-tree.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { NbIconModule, NbContextMenuModule, NbButtonModule, NbTooltipModule, NbSpinnerModule } from '@nebular/theme';

import { TreeListComponent } from './tree-list/tree-list.component';
import { TreeMenuOptionsComponent } from './tree-menu-options/tree-menu-options.component';
import { TreeDragAndDropComponent } from './tree-drag-and-drop/tree-drag-and-drop.component';




@NgModule({
  declarations: [
    TreeListComponent,
    TreeMenuOptionsComponent,
    TreeDragAndDropComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NbContextMenuModule,
    NbIconModule,  
    NbButtonModule, 
    NbTooltipModule, 
    NbSpinnerModule
  ],
  providers:[
    BalanceSheetTreeService
  ],
  exports:[
    TreeListComponent,
    TreeMenuOptionsComponent,
    TreeDragAndDropComponent
  ]
})
export class SharedModule { }
