import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityComponent } from './entity.component';
import { MaterialModule } from '../../shared/material/material.module';
import { AddEntityComponent } from './add-entity/add-entity.component';
import {
  NbButtonModule,
  NbCardModule,
  NbContextMenuModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule, NbTagModule,
} from '@nebular/theme';
import { EntityViewComponent } from './entity-view/entity-view.component';
import { NbActionsModule, NbTooltipModule, NbFormFieldModule } from '@nebular/theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { ThemeModule } from '../../theme/theme.module';
import { NbSecurityModule } from '@nebular/security';


@NgModule({
  declarations: [
    EntityComponent,
    AddEntityComponent,
    EntityViewComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbActionsModule,
    NbContextMenuModule,
    NbTooltipModule,
    NgSelectModule,
    NbSpinnerModule,
    NbFormFieldModule,
    ThemeModule,
    NbTagModule,
    NbSecurityModule
  ]
})
export class EntityModule { }
