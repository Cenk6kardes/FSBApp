import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LibrariesComponent } from './libraries.component';
import { EditCoaComponent } from './edit-coa/edit-coa.component';

const routes: Routes = [
    {
        path: '',
        component: LibrariesComponent,
        children: [
            {
                path: '',
                redirectTo: 'libraries',
                pathMatch: 'full',
            },
            {
                path: 'edit/:id/:name/:coaid',
                component: EditCoaComponent,
            },
            
        ]
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LibrariesRoutingModule {
}