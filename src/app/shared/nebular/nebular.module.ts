import { NgModule } from '@angular/core';
import {
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
} from '@nebular/theme';

const NEBULAR_MODULES = [
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
];

@NgModule({
  imports: [],
  exports: [...NEBULAR_MODULES],
})
export class MaterialModule {}
