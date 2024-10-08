import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TableModule } from 'ngx-easy-table';
import {MatListModule} from '@angular/material/list';

const MaterialComponents = [
  MatToolbarModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatIconModule,
  MatGridListModule,
  MatTableModule,
  MatCardModule,
  MatProgressBarModule,
  MatSnackBarModule,
  ReactiveFormsModule,
  FormsModule,
  MatButtonModule,
  MatTableModule,
  MatIconModule,
  MatMenuModule,
  MatSlideToggleModule,
  FormsModule,
  MatTreeModule,
  MatCheckboxModule,
  MatTabsModule,
  MatInputModule,
  MatDialogModule,
  MatInputModule,
  MatSlideToggleModule,
  TableModule,
  MatListModule,
]
@NgModule({
  imports: [
    MaterialComponents
  ],
  providers: [{
    provide: MatDialogRef,
    useValue:{}
  }
  ],
  exports: [
    MaterialComponents
  ]
})
export class MaterialModule { }
