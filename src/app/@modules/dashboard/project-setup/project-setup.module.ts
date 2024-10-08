import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectSetupComponent } from './project-setup.component';
import { NbAutocompleteModule, NbCardModule, NbDatepickerModule, NbInputModule, NbSelectModule, NbSpinnerModule } from '@nebular/theme';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  declarations: [
    ProjectSetupComponent
  ],
  imports: [
    CommonModule,
    NbSelectModule,
    NbDatepickerModule,
    NbInputModule,
    NbCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatStepperModule,
    NbAutocompleteModule,
    NbSpinnerModule
  ]
})
export class ProjectSetupModule { }
