import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, defer, distinctUntilChanged, map, merge, Observable, of, switchMap } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { IProjectTable } from 'src/app/@modules/dashboard/interfaces/projects.interface';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {
  public searchField = new FormControl();
  public searchValue: string = '';
  public filteredProjects$: Observable<any[]>;
  public projects: IProjectTable[] = [];
  
  constructor(private dashboardService: DashboardService, private router: Router) { }

  ngOnInit(): void {
    const searchString$ = merge(      
      defer(() => of(this.searchField.value)),
      this.searchField.valueChanges,
    ).pipe(
      debounceTime(500),
      distinctUntilChanged(),
    );
    this.filteredProjects$ = searchString$
    .pipe(
      switchMap((searchString: string) =>
        this.filter(searchString)
      ),
    );
  }

  private filter(value: string): Observable<any[]> {
    if (value) {
      return this.dashboardService.projectTable
        .pipe(
          map(val => {
            this.projects = val;
            let filteredValues = val?.filter(a => {return a.name?.toLowerCase().includes(value?.toLowerCase())}).map(p => {return {name: p.name, id: p.id}});
            if (filteredValues.length > 0) {
              return filteredValues;
            } else {
              return [{name: "No results found", id: "-1"}];
            }
          })
        );
    }
    return of([{name: "Start typing..", id: "-2"}]);
  }

  onSelectionChange(project: IProjectTable) {
    if(project) {
      this.router.navigate(['home/dashboard/project', project.id]);
    }
    this.searchValue = "";
  }
}
