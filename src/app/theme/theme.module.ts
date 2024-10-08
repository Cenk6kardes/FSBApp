import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OneColumnLayoutComponent } from './layout/one-column/one-column.component';
import { NbThemeModule, DEFAULT_THEME, NbActionsModule, NbButtonModule, NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuModule, NbSearchModule, NbSelectModule, NbSidebarModule, NbUserModule, DEFAULT_THEME as baseTheme, NbListModule, NbCardModule, NbPopoverModule, NbAutocompleteModule, NbFormFieldModule, NbInputModule, NbRadioModule, NbDatepickerModule, NbTimepickerModule, NbCheckboxModule, NbSpinnerModule, NbTooltipModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { TwoColumnsComponent } from './layout/two-columns/two-columns.component';
import { TemperaturePipe } from './pipes/temperature.pipe';
import { UserDetailsComponent } from './components/header/user-details/user-details.component';
import { GlobalSearchComponent } from './components/header/global-search/global-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationComponent } from './components/header/notification/notification.component';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NbSecurityModule } from '@nebular/security';

const NB_MODULES = [
  NbLayoutModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  ReactiveFormsModule,
  NbListModule,
  NbDatepickerModule,
  NbTimepickerModule,
  NbCardModule,
  NbPopoverModule,
  NbCheckboxModule,
  FormsModule,
  MatIconModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  NbRadioModule,
  NbSidebarModule,
  NbContextMenuModule,
  NbSecurityModule,
  NbButtonModule,
  NbSelectModule,
  NbIconModule,
  NbEvaIconsModule,
  NbAutocompleteModule,
  NbFormFieldModule,
  NbInputModule,
  NbSpinnerModule,
  NbTooltipModule,
];

const COMPONENTS = [
  HeaderComponent,
  FooterComponent,
  UserDetailsComponent,
  GlobalSearchComponent,
  NotificationComponent,
  // SearchInputComponent,
  // TinyMCEComponent,
  OneColumnLayoutComponent,
  // ThreeColumnsLayoutComponent,
  // TwoColumnsLayoutComponent,
];

const PIPES = [TemperaturePipe];
@NgModule({
  declarations: [...COMPONENTS, ...PIPES, TwoColumnsComponent],
  imports: [CommonModule, ...NB_MODULES],
  exports: [CommonModule, ...COMPONENTS, ...PIPES]
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders<ThemeModule> {
    return {
      ngModule: ThemeModule,
      providers: [
        ...NbThemeModule.forRoot(
          {
            name: 'default',
          },
          [ /*customizedThemes*/],
        ).providers || [],
      ],
    };
  }
}
