import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { EngagementCoaService } from 'src/app/@core/services/library/engagement-coa.service';
import { GlobalCoaService } from 'src/app/@core/services/library/global-coa.service';
import { ProjectService } from 'src/app/@core/services/project/project.service';
import { CatalogService } from 'src/app/@core/services/shared/catalog/catalog.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';

@Component({
  selector: 'app-fs-structuring',
  templateUrl: './fs-structuring.component.html',
  styleUrls: ['./fs-structuring.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FsStructuringComponent implements OnInit {

  tabIndex = 0;
  constructor(
    private _projectService: ProjectService,
    private _catalogServie: CatalogService,
    private _globalCoaService: GlobalCoaService,
    private _engCoaService: EngagementCoaService,
    private _dialogService: NbDialogService,
    private _toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  setTab = (val: number) => {
    this.tabIndex = val;
  }

}
