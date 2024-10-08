import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from './services/utils/layout.service';
import { EngagementCoaService } from './services/library/engagement-coa.service';
import { GlobalCoaService } from './services/library/global-coa.service';
import { ToastrService } from './services/shared/toastr/toastr.service';
import { EntityService } from './services/entity/entity.service';
import { EngagementService } from './services/entity/engagement.service';
import { HttpService } from './services/shared/http/http.service';
import { CatalogService } from './services/shared/catalog/catalog.service';

export const FSB_CORE_PROVIDERS = [
  HttpService,
  LayoutService,
  ToastrService,
  EntityService,
  EngagementService,
  EngagementCoaService,
  GlobalCoaService,
  CatalogService,
  // StateService,
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ]
})
export class CoreModule {

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...FSB_CORE_PROVIDERS,
      ],
    };
  }
}
